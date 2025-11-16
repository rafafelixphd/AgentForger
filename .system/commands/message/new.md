# /message:new

Start brief AI discussion in workspace/conversation/_inbox.md.

## Usage
```
message:new --message "hello world" --to "agent-name"
message:new "hello world"  # positional argument for message
```

## Parameters
- `--message`: The message content to send (required)
- `--to`: Agent to respond (optional, defaults to discussion-moderator)

## Workflow
1. Create new discussion thread in communication inbox
2. Route message to specified agent for response
3. Generate professional, conversational content
4. Maintain focus on brief, actionable insights
5. Save completed thread to communication directory

## Examples
```
message:new --message "Should we explore VLA robotics?" --to "discussion-moderator"
message:new --message "How does machine learning work?" --to "general-assistant"
message:new "Hello world"  # uses default agent
```