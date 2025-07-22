@echo off
echo ============================================================
echo 🧪 TESTING PRODUCTION API - ROTIXAI
echo ============================================================
echo.

curl -X POST "https://rotix-frc58oqfu-fernandos-projects-8346d0e1.vercel.app/api/chat" ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"vinho\"}" ^
  --max-time 30 ^
  --verbose

echo.
echo ============================================================
echo ✅ TEST COMPLETED
echo ============================================================
pause
