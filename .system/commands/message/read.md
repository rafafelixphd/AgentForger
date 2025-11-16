# /message:read

Read the latest messages from workspace/conversation/_inbox.md.

## Usage
```
message:read [--count X]
```

## Parameters
- `--count`: Number of latest messages to read (default: 5)

## Workflow
1. Access latest messages from communication inbox
2. Parse and format messages
3. Return results in readable format

## Examples
```
message:read --count 3
```