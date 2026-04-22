from groq import Groq
from app.core.config import get_settings
from typing import Optional, Dict, Any
import pandas as pd
import json
import logging

logger = logging.getLogger(__name__)


class GroqService:
    """Service for interacting with Groq AI (Llama models)."""
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.groq_api_key
        self._initialized = False
        self.client: Optional[Groq] = None
        
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
                self._initialized = True
                logger.info("Groq service initialized")
            except Exception as e:
                logger.error(f"Error initializing Groq: {e}")
    
    def is_available(self) -> bool:
        """Check if Groq service is available."""
        return self._initialized and self.client is not None
    
    async def analyze_dataset(
        self, 
        df: pd.DataFrame, 
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze a dataset using Groq."""
        if not self._initialized or not self.client:
            raise ValueError("Groq service not initialized")
        
        # Generate dataset summary
        summary = self._generate_dataset_summary(df)
        
        # Build the prompt
        if custom_prompt:
            prompt = custom_prompt
        else:
            prompt = self._build_analysis_prompt(summary)
        
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data analysis expert. Provide clear, actionable insights from datasets."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            analysis_text = response.choices[0].message.content
            
            return {
                "insights": analysis_text,
                "summary": summary["description"],
                "recommendations": self._extract_recommendations(analysis_text),
                "statistics": summary["stats"]
            }
        except Exception as e:
            logger.error(f"Error analyzing with Groq: {e}")
            raise
    
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
        """Build the analysis prompt for Groq."""
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
                if any(word in line.lower() for word in ['recommend', 'should', 'consider', 'suggest']):
                    recommendations.append(line.lstrip('-•* ').strip())
        
        return recommendations[:5]  # Limit to top 5
