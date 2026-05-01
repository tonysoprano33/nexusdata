# NexusData AI - Portfolio Case Study

## Project Summary

NexusData AI is a full-stack data automation product for analysts and business users. It accepts raw datasets, cleans them, profiles their structure, detects analytical signals, generates dashboards, answers dataset questions and exports executive-ready reports.

## Problem

Analysts often lose time moving between spreadsheets, manual cleaning, chart exploration and report writing. The goal was to create a single workflow that reduces the time from "raw file" to "business-ready insight".

## What I Built

- FastAPI backend for file ingestion, validation, analysis and export endpoints.
- Pandas data pipeline for parsing CSV, Excel and JSON files.
- Automated cleaning report with before/after quality scoring.
- Statistical profiling for numeric, categorical and datetime columns.
- ML-assisted modules for anomalies, churn-like signals, RFM segmentation, regression and clustering.
- AI insight layer with Gemini/Groq support and deterministic fallback logic.
- Next.js dashboard with upload, history, data preview, visual explorer, chat and reports.
- PDF and PowerPoint report generation.
- Portfolio metrics endpoint that summarizes real stored analyses.

## Architecture Decisions

- Used FastAPI because the API is data-heavy and benefits from Python's analytics ecosystem.
- Used Next.js and TypeScript for a polished, typed frontend that can be deployed independently.
- Added a local JSON fallback so the project works without paid infrastructure or database setup.
- Kept AI provider access optional so demos remain reliable even when API keys are missing.
- Generated chart-ready payloads in the backend to keep frontend visual components simple.

## Automation Highlights

- One upload triggers parsing, cleaning, profiling, ML heuristics, insight generation and persistence.
- Reports can be exported without manual formatting.
- Suggested chat questions are generated from dataset shape.
- The Intelligence page displays real portfolio metrics rather than static marketing numbers.

## Skills Demonstrated

- Data analysis and data quality automation.
- Backend API design and error handling.
- Full-stack product design.
- AI integration with graceful fallback behavior.
- Frontend dashboard development.
- Report automation.
- Deployment configuration.

## Next Improvements

- Add authentication and workspace-level dataset ownership.
- Add queued background jobs for large files.
- Add Playwright smoke tests for the upload/dashboard flow.
- Add richer report templates with embedded charts.
- Add dataset comparison and scheduled analysis runs.
