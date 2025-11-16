# /output:format

Control the output format of responses.

## Usage
```
output:format --type json
output:format --type markdown
output:format --type text
```

## Parameters
- `--type`: Output format (required)
  - `json`: JSON format
  - `markdown`: Markdown format
  - `text`: Plain text format

## Examples
```
output:format --type json
output:format --type markdown
```

## Workflow
1. Validate format type
2. Update system settings
3. Apply to future responses