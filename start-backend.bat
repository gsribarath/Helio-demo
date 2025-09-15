@echo off
setlocal
cd /d "%~dp0backend"

if not exist ..\.venv (
	echo Creating virtual environment...
	python -m venv ..\.venv
)
call ..\.venv\Scripts\activate
pip install -r requirements.txt

echo Starting Helio backend (username-only auth)...
python app_new.py
endlocal