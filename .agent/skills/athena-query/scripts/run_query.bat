@echo off
REM =======================================================
REM 1. Call your company's tool to get the credentials here
REM =======================================================

REM Example A: If your company tool outputs the keys to the console, you can capture them:
REM for /f "delims=" %%i in ('company-tool get-access-key') do set AWS_ACCESS_KEY_ID=%%i
REM for /f "delims=" %%i in ('company-tool get-secret-key') do set AWS_SECRET_ACCESS_KEY=%%i
REM for /f "delims=" %%i in ('company-tool get-session-token') do set AWS_SESSION_TOKEN=%%i

REM Example B: If your company provides a script that you run to set variables:
REM call "C:\path\to\company_login_script.bat"

REM TODO: Update the above logic to fetch actual credentials

REM =======================================================
REM 2. Run the Athena Python script passing all arguments
REM =======================================================
python "%~dp0run_athena_query.py" %*
