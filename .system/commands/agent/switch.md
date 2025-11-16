# /agent:switch

Switch to a different agent for future interactions.

## Usage
```
agent:switch --name "agent-name"
```

## Parameters
- `--name`: Name of the agent to switch to (required)

## Examples
```
agent:switch --name "email-assistant"
agent:switch --name "discussion-moderator"
```

## Workflow
1. Validate agent exists
2. Update active agent setting
3. Confirm switch