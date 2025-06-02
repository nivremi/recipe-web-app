@echo off
start "Backend" cmd /k "call orbital\Scripts\activate.bat && python backend\app\run.py"
start "Frontend" cmd /k "call orbital\Scripts\activate.bat && cd frontend && npm run dev"