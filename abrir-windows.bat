@echo off
cd /d "%~dp0site"
start "Organizador de cajas" http://localhost:8080
py -m http.server 8080 --bind 127.0.0.1
pause
