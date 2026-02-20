# Windows Setup Instructions

This guide helps you set up the PLO-GA Mapping System on Windows with WAMP.

## Prerequisites

- WAMP Server (already installed)
- Node.js v24.11.1 (already installed)
- Python 3.x (needs to be installed)

## Python Setup for Document Parsing

The document parsing feature requires Python and the `python-docx` library.

### Step 1: Check if Python is installed

Open Command Prompt and run:
```cmd
python --version
```

If you see a version number (e.g., Python 3.11.0), Python is installed. Skip to Step 3.

If you get an error, proceed to Step 2.

### Step 2: Install Python

1. Download Python from: https://www.python.org/downloads/
2. Run the installer
3. **IMPORTANT**: Check "Add Python to PATH" during installation
4. Click "Install Now"
5. After installation, restart Command Prompt and verify:
   ```cmd
   python --version
   ```

### Step 3: Install required Python libraries

Navigate to your project directory:
```cmd
cd C:\wamp\www\plo-ga-mapping-system\scripts
```

Install the required library:
```cmd
python -m pip install -r requirements.txt
```

Or install directly:
```cmd
python -m pip install python-docx
```

### Step 4: Test the parser

Test if the parser works:
```cmd
cd C:\wamp\www\plo-ga-mapping-system
python scripts\parse-docx.py "path\to\your\test.docx"
```

If you see JSON output, the parser is working correctly!

## Troubleshooting

### "python is not recognized"

- Make sure Python is added to PATH
- Restart Command Prompt after installing Python
- Try using `py` instead of `python`:
  ```cmd
  py --version
  py -m pip install python-docx
  ```

### "No module named 'docx'"

- Install the library:
  ```cmd
  python -m pip install python-docx
  ```

### Document parsing fails in the web app

1. Check if Python works from command line
2. Check if `python-docx` is installed
3. Make sure the WAMP server can execute Python (it should work by default)
4. Check the server logs in the terminal where you ran `pnpm run dev`

## Alternative: Use Manual Entry

If you have trouble setting up Python, you can still use the system by:
1. Using the "Manual Entry" feature to input PLOs and mappings directly
2. Skipping the document upload feature

The manual entry provides the same functionality without requiring document parsing.
