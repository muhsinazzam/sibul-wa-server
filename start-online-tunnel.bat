@echo off
title SIBUL ONLINE INTERNET TUNNEL (CLOUDFLARE)
color 0a
echo ====================================================================
echo   MEMBUAT LINK ONLINE INTERNET GRATIS UNTUK SIBUL WHATSAPP GATEWAY
echo ====================================================================
echo.
echo Pastikan server (start-server.bat) sudah kamu jalankan terlebih dahulu!
echo.
echo Menghubungkan port 2785 ke Cloudflare Quick Tunnel (100%% GRATIS)...
echo.
cd /d "%~dp0"
cloudflared.exe tunnel --url http://localhost:2785
pause
