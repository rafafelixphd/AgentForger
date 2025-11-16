#!/bin/bash
# Message handler utility
# Calls the Python message handler script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/message-handler.py"

# Pass all arguments to the Python script
python3 "$PYTHON_SCRIPT" "$@"