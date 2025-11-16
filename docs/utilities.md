# Utilities System

## Overview

Utilities provide reusable functionality that can be called from any workflow phase. They are organized by category and can be written in multiple languages.

## Utility Categories

### Text Utilities (`hooks/utilities/text/`)

Text processing and analysis:

```bash
# word-counter.sh
#!/bin/bash
# Count words in text input
echo "$1" | wc -w
```

```javascript
// formatter.js
function formatText(text, style) {
  // Text formatting logic
  return formattedText;
}
```

### File Utilities (`hooks/utilities/file/`)

File operations and management:

```bash
# file-ops.sh
#!/bin/bash
# File operations helper
cp "$1" "$2"  # Copy file
mkdir -p "$3" # Create directory
```

```javascript
// reader.js
async function readFile(path) {
  // File reading logic
  return content;
}
```

### System Utilities (`hooks/utilities/system/`)

System monitoring and diagnostics:

```bash
# system-health.sh
#!/bin/bash
# System health check
ps aux | grep -c "node.*\.system"
```

```python
# validator.py
def validate_structure(data, schema):
    """Validate data against schema"""
    # Validation logic
    return is_valid
```

## Utility Integration

Utilities are called from workflow phases:

```javascript
async executeWorkflowPhase(context) {
  // Execute multiple utilities
  const utilities = [
    { category: 'text', name: 'formatter', args: ['input.txt'] },
    { category: 'file', name: 'reader', args: ['path/to/file'] },
    { category: 'system', name: 'validator', args: ['data', 'schema'] }
  ];

  const results = await this.executeUtilities(utilities);
  return results;
}
```

## Creating New Utilities

### 1. Choose Category and Language
- **Text**: Text processing (Bash, JavaScript, Python)
- **File**: File operations (Bash, JavaScript)
- **System**: System monitoring (Bash, Python)

### 2. Create Utility File
```bash
# hooks/utilities/text/new-utility.sh
#!/bin/bash
# Utility description
# $1, $2, etc. are input parameters
echo "Processing: $1"
# Your logic here
```

### 3. Make Executable (for Bash scripts)
```bash
chmod +x hooks/utilities/text/new-utility.sh
```

### 4. Test Utility
```javascript
// In workflow
const result = await this.executeUtilities([
  { category: 'text', name: 'new-utility', args: ['test'] }
]);
```

## Utility Naming Conventions

- Use lowercase with hyphens: `word-counter.sh`
- Include file extension for language identification
- Make names descriptive of function
- Follow existing patterns in each category

## Error Handling

Utilities should handle errors gracefully:

```bash
#!/bin/bash
if [ $# -eq 0 ]; then
  echo "Error: No input provided" >&2
  exit 1
fi
# Process input
```

```javascript
function processText(input) {
  if (!input) {
    throw new Error('Input required');
  }
  // Processing logic
}
```

## Best Practices

- **Single Responsibility**: Each utility does one thing well
- **Error Handling**: Always handle edge cases and invalid inputs
- **Documentation**: Comment complex logic
- **Testing**: Test utilities independently before integration
- **Performance**: Keep utilities lightweight and efficient