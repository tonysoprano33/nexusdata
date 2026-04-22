import google.generativeai as genai
from app.core.config import get_settings
from typing import Optional, Dict, Any
import pandas as pd
import json
import logging

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google's Gemini AI."""
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self._initialized = False
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self._initialized = True
                logger.info("Gemini service initialized")
            except Exception as e:
                logger.error(f"Error initializing Gemini: {e}")
    
    def is_available(self) -> bool:
        """Check if Gemini service is available."""
        return self._initialized
    
    async def analyze_dataset(
        self, 
        df: pd.DataFrame, 
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze a dataset using Gemini."""
        if not self._initialized:
            raise ValueError("Gemini service not initialized")
        
        # Generate dataset summary
        summary = self._generate_dataset_summary(df)
        
        # Build the prompt
        if custom_prompt:
            prompt = custom_prompt
        else:
            prompt = self._build_analysis_prompt(summary)
        
        try:
            response = self.model.generate_content(prompt)
            analysis_text = response.text
            
            return {
                "insights": analysis_text,
                "summary": summary["description"],
                "recommendations": self._extract_recommendations(analysis_text),
                "statistics": summary["stats"]
            }
        except Exception as e:
            logger.error(f"Error analyzing with Gemini: {e}")
            # Return graceful fallback
            return {
                "insights": f"Analysis could not be completed due to Gemini API error: {str(e)}. Please try again or check your API key.",
                "summary": summary["description"],
                "recommendations": ["Verify your Gemini API key is valid", "Check Google AI service status"],
                "statistics": summary["stats"],
                "error": str(e)
            }
    
    def _generate_dataset_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate a summary of the dataset."""
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        stats = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "column_names": df.columns.tolist()
        }
        
        if numeric_cols:
            stats["numeric_summary"] = df[numeric_cols].describe().to_dict()
        
        description = f"Dataset with {len(df)} rows and {len(df.columns)} columns. "
        description += f"Numeric columns: {len(numeric_cols)}. "
        description += f"Categorical columns: {len(categorical_cols)}."
        
        return {
            "description": description,
            "stats": stats,
            "sample_data": df.head(5).to_string()
        }
    
    def _build_analysis_prompt(self, summary: Dict[str, Any]) -> str:
        """Build the analysis prompt for Gemini."""
        prompt = f"""Analyze the following dataset and provide insights:

Dataset Summary:
{summary['description']}

Columns: {', '.join(summary['stats']['column_names'])}

Sample Data:
{summary['sample_data']}

Please provide:
1. Key insights about the data patterns
2. Notable trends or correlations
3. Data quality observations
4. Actionable recommendations for business decisions

Format your response in clear sections with bullet points where appropriate."""
        
        return prompt
    
    def _extract_recommendations(self, analysis_text: str) -> list:
        """Extract recommendations from analysis text."""
        recommendations = []
        lines = analysis_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                if 'recommend' in line.lower() or 'should' in line.lower():
                    recommendations.append(line.lstrip('-•* ').strip())
        
        return recommendations[:5]  # Limit to top 5
