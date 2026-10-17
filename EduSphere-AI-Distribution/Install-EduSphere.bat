@echo off
title Installing EduSphere AI
color 0A
echo =======================================================
echo          EduSphere AI - Enterprise Installation
echo =======================================================
echo.
echo Installing EduSphere AI to your system...

set "TARGET_DIR=%LOCALAPPDATA%\EduSphereAI"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo [1/3] Copying application files...
copy /Y "%~dp0EduSphere-AI.exe" "%TARGET_DIR%\EduSphere-AI.exe" >nul

echo [2/3] Creating Desktop and Start Menu Shortcuts...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'EduSphere AI.lnk')); $s.TargetPath = '%TARGET_DIR%\EduSphere-AI.exe'; $s.IconLocation = '%TARGET_DIR%\EduSphere-AI.exe,0'; $s.Save()"
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $startMenu = [System.Environment]::GetFolderPath('StartMenu'); $programs = [System.IO.Path]::Combine($startMenu, 'Programs'); $s = $ws.CreateShortcut([System.IO.Path]::Combine($programs, 'EduSphere AI.lnk')); $s.TargetPath = '%TARGET_DIR%\EduSphere-AI.exe'; $s.IconLocation = '%TARGET_DIR%\EduSphere-AI.exe,0'; $s.Save()"

echo [3/3] Registering Windows App...
echo.
echo =======================================================
echo    Installation Complete! Launching EduSphere AI...
echo =======================================================
start "" "%TARGET_DIR%\EduSphere-AI.exe"
timeout /t 3 >nul
exit