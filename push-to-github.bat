@echo off
title Push LandStack to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing LandStack Code to https://github.com/Harish-Raj-R/landsih26
echo ========================================================
echo.
"C:\Users\srira\tools\git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo SUCCESS: LandStack has been pushed to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo Push failed. Please check the error message above.
    echo ========================================================
)
echo.
pause
