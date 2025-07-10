@echo off
start "Backend" cmd /k "call orbital\Scripts\activate.bat && cd backend\app && flask run --debug"
start "Frontend" cmd /k "call orbital\Scripts\activate.bat && cd frontend && npm run dev"