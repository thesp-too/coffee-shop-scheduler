@echo off
echo ====================================
echo 咖啡店排班系统 - 启动服务
echo ====================================
echo.
echo 步骤1: 启动本地服务器...
start /B python server.py
timeout /t 2 /nobreak > nul
echo.
echo 步骤2: 启动ngrok内网穿透...
echo.
echo 请确保已下载ngrok并放在当前目录或系统PATH中
echo 下载地址: https://ngrok.com/download
echo.
echo 按任意键启动ngrok...
pause > nul
ngrok http 8080
