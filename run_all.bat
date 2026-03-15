@echo off
echo Starting Virtual Mandi Services...

echo [1/3] Starting Backend on http://localhost:5000 ...
start cmd /k "d:\Virtual-Mandi-main\.venv\Scripts\activate.bat && cd /d d:\Virtual-Mandi-main\Backend && python app.py"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Buyer App ...
start cmd /k "cd /d "d:\Virtual-Mandi-main\Frontend\Buyer App" && npm run dev"

echo [3/3] Starting Seller App ...
start cmd /k "cd /d "d:\Virtual-Mandi-main\Frontend\Seller App" && npm run dev"

echo.
echo ==========================================
echo  All services started in separate windows!
echo  Backend  : http://localhost:5000
echo  Buyer App: http://localhost:5173
echo  Seller App: http://localhost:5174 (approx)
echo ==========================================
