@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "FAILED=0"

call :Run add-accounting-proxy.bat
call :Run add-auditor-proxy.bat
call :Run add-applicationconfiguration-proxy.bat
call :Run add-backgroundjobs-proxy.bat
call :Run add-collaboration-proxy.bat
call :Run add-eleoncoremultitenancy-proxy.bat
call :Run add-eventmanagement-proxy.bat
call :Run add-filemanager-proxy.bat
call :Run add-gatewaymanagement-proxy.bat
call :Run add-google-proxy.bat
call :Run add-healthcheck-proxy.bat
call :Run add-jobscheduler-proxy.bat
call :Run add-languagemanagement-proxy.bat
call :Run add-lifecyclefeature-proxy.bat
call :Run add-notificator-proxy.bat
call :Run add-providers-proxy.bat
call :Run add-sitesmanagement-proxy.bat
call :Run add-storage-proxy.bat
call :Run add-systemlog-proxy.bat
call :Run add-templating-proxy.bat
call :Run add-tenantmanagement-proxy.bat
call :Run add-identity-querying-proxy.bat
call :Run add-dynamicdashboard-proxy.bat

echo.
if "%FAILED%"=="1" (
  echo One or more proxy scripts FAILED.
  exit /b 1
)

echo All proxy scripts completed OK.
exit /b 0

:Run
echo.
echo ===== Running %~1 =====
cmd /d /c ""%SCRIPT_DIR%%~1""
set "EC=%ERRORLEVEL%"
if not "%EC%"=="0" (
  echo [ERROR] %~1 exited with code %EC%
  set "FAILED=1"
) else (
  echo [OK] %~1
)
exit /b 0