# /output:verbosity

Control the verbosity level of agent responses.

## Usage
```
output:verbosity --level low
output:verbosity --level medium
output:verbosity --level high
output:verbosity --level off
```

## Parameters
- `--level`: Verbosity level (required)
  - `low`: ~140 characters (concise)
  - `medium`: ~520 characters (balanced)
  - `high`: ~740 characters (detailed)
  - `off`: Unrestricted length

## Examples
```
output:verbosity --level low
output:verbosity --level medium
```

## Workflow
1. Validate verbosity level
2. Update system settings
3. Apply to future responses