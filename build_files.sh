#!/bin/bash
echo "--- Installing Python dependencies ---"
python3 -m pip install -r requirements.txt

echo "--- Collecting Static Files ---"
python3 manage.py collectstatic --no-input --clear

echo "--- Build Completed Successfully ---"
