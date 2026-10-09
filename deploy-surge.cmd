@echo off
setlocal
title Deploy novel-web to Surge.sh
cd /d "%~dp0"
set "npm_config_cache=%~dp0.npm-cache"

echo ================================================
echo   Deploy novel-web  --^>  Surge.sh
echo ================================================
echo.
echo  dist folder: %cd%\dist
echo.
echo  First run asks for your EMAIL and a PASSWORD
echo  (auto register, no captcha, no phone).
echo.
set /p DOMAIN=Domain [novel-reader-demo.surge.sh]: 
if "%DOMAIN%"=="" set "DOMAIN=novel-reader-demo.surge.sh"
echo.
echo Deploying to https://%DOMAIN% ...
echo.
call npx --yes surge dist %DOMAIN%
echo.
echo ================================================
echo   Done. Copy the URL shown above.
echo ================================================
echo.
pause