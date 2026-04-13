#!/bin/bash
# Start script for Render.com

# Set PYTHONPATH to include the backend directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"

# Change to backend directory
cd backend

# Initialize database
python -c "from app.db.database import init_db; init_db()"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port $PORT
