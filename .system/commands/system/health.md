# /system:health

Check the health and status of the Agent Forger system.

## Usage
```
system:health [--verbose]
```

## Parameters
- `--verbose`: Show detailed health information [optional]

## Workflow
1. Check system configuration integrity
2. Validate agent and workflow registrations
3. Test command routing functionality
4. Verify file system permissions
5. Report overall system health status

## Examples
```
system:health
system:health --verbose
```