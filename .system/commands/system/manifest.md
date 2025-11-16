# /system:manifest

Display the Agent Forger system manifest and configuration information.

## Usage
```
system:manifest [--format json|text]
```

## Parameters
- `--format`: Output format - json or text (default: text)

## Workflow
1. Load system manifest configuration
2. Gather system metadata and statistics
3. Format information according to requested output type
4. Display comprehensive system information

## Examples
```
system:manifest
system:manifest --format json
```