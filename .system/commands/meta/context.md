# /meta:context

Manage global context for enhanced AI interactions.

## Usage
```
meta:context --add "additional context information"
meta:context --list
meta:context --clear
```

## Parameters
- `--add`: Add context to the global session (required for adding)
- `--list`: Show all accumulated context (no value needed)
- `--clear`: Clear all session context (no value needed)

## Examples
```
meta:context --add "We're discussing AI ethics in healthcare applications"
meta:context --list
meta:context --clear
```

## Global Context Usage
The `--context` parameter can be added to ANY command:

```
/message:new --message "What are the concerns?" --context "AI ethics discussion"
/agent:switch --name "specialist" --context "Need expert analysis"
/output:verbosity --level high --context "Detailed technical response needed"
```

Context accumulates across commands and helps AI agents provide more relevant responses.

## Workflow
1. Parse context management action
2. Update global context store
3. Display current context state