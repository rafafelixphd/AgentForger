# Example: Message Command Implementation

This document demonstrates how the message system integrates all components of the `.system` architecture, using the conversation messaging approach as a complete working example.

## Overview

The message system implements document-based communication that transforms ephemeral chat into persistent, searchable conversations. This example shows how all integration components work together to create a functional messaging workflow.

## Component Integration

### 1. Command Definition (`commands/message/`)

**Files:**
- `new.md` - Command documentation for starting discussions
- `read.md` - Command documentation for reading messages

**Integration:** These markdown files define the user interface and parameter specifications that users interact with.

### 2. Workflow Implementation (`hooks/workflows/message.js`)

**Key Features:**
```javascript
class MessageWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = [
      'message:new',
      'message:read'
    ];
  }

  async executeWorkflowPhase(context) {
    if (context.command === 'message:new') {
      return await this.handleNewMessage(context);
    } else if (context.command === 'message:read') {
      return await this.handleReadMessages(context);
    }
  }
}
```

**Integration:** Extends `BaseWorkflow` and implements the 5-phase pipeline for message operations.

### 3. Orchestrator Integration (`hooks/core/orchestrator.js`)

**Registration:**
```javascript
const MessageWorkflow = require('../workflows/message');

class Orchestrator {
  constructor() {
    this.workflows = new Map();
    this.initialize();
  }

  async initialize() {
    this.workflows.set('message', new MessageWorkflow(this));
  }

  async executeCommand(command, params) {
    const [category] = command.split(':');
    const workflow = this.workflows.get(category);
    return await workflow.execute({ command, params });
  }
}
```

**Integration:** Routes commands to appropriate workflows and manages the execution pipeline.

### 4. Template System (`templates/messaging/conversation-thread.json`)

**Structure:**
```json
{
  "name": "Conversation Thread",
  "platform": "conversation",
  "constraints": {
    "maxChars": 500,
    "sections": ["header", "message"]
  },
  "structure": [
    {
      "section": "header",
      "aiPrompt": "Generate a conversation status header"
    },
    {
      "section": "message",
      "aiPrompt": "Create a concise conversation message about: {topic}"
    }
  ]
}
```

**Integration:** Defines structured output formats with AI prompts for content generation.

### 5. Agent System (`agents/discussion-moderator.md`)

**Definition:**
```yaml
---
name: discussion-moderator
description: Manages conversation flow and ensures productive discussions
personality_traits:
  - Facilitative: Guides conversations constructively
core_values:
  - Productive dialogue
communication_guidelines:
  - Keep discussions focused
---
```

**Integration:** Provides specialized AI personas for message processing and response generation.

### 6. Rules System (Validation)

**Platform Rules:**
```json
{
  "platform": "conversation",
  "characterLimits": { "message": 500 },
  "validationChecks": ["character_limit"]
}
```

**Integration:** Enforces platform constraints and quality standards during message processing.

### 7. Utilities System

**Text Processing:**
```bash
# word-counter.sh - Count words in messages
echo "$1" | wc -w
```

**File Operations:**
```bash
# file-ops.sh - Save messages to files
cp "$1" "$2"
```

**Integration:** Provide reusable functions for text processing, file operations, and system monitoring.

## Execution Flow

### Command Processing Pipeline

```
User Input: /message:new --message "What are the main challenges in AI ethics?" --to "discussion-moderator"
           ↓
Orchestrator → Routes to MessageWorkflow
           ↓
Phase 1: Initialization → Load utilities, validate command
Phase 2: Parameters → Parse --message "What are the main challenges in AI ethics?" --to "discussion-moderator"
Phase 3: Workflow → Generate message content using template
Phase 4: Validation → Apply platform rules and quality checks
Phase 5: Output → Save to communication/conversation/_inbox.md
           ↓
Response: Success confirmation with message details
```

### Component Interactions

**Template + Agent Integration:**
```javascript
// In workflow phase
const template = await this.loadTemplate('conversation-thread');
const agent = await this.loadAgent('discussion-moderator');
const content = await this.generateContent(template, context.params, agent);
```

**Rules + Utilities Integration:**
```javascript
// In validation phase
const validation = await this.validateWithRules(['conversation'], content);
const wordCount = await this.executeUtilities([{
  category: 'text',
  name: 'word-counter',
  args: [content]
}]);
```

## File Structure Integration

```
.system/
├── commands/message/          # User interface definitions
│   ├── new.md                # Command documentation
│   └── read.md               # Command documentation
├── hooks/
│   ├── core/orchestrator.js   # Command routing
│   └── workflows/message.js   # Pipeline implementation
├── templates/messaging/       # Content structure templates
│   └── conversation-thread.json # Message format definition
├── agents/                    # AI personas
│   └── discussion-moderator.md # Message processing agent
├── rules/platform/            # Platform constraints
│   └── conversation-rules.json # Conversation-specific rules
└── hooks/utilities/           # Reusable functions
    ├── text/word-counter.sh   # Text processing
    └── file/file-ops.sh       # File operations
```

## Data Flow

### Input Processing
1. **Command Parsing:** `/message:new --message "What are the main challenges in AI ethics?" --to "discussion-moderator"` → `{command: 'message:new', params: {message: 'What are the main challenges in AI ethics?', to: 'discussion-moderator'}}`
2. **Workflow Selection:** Category 'message' → MessageWorkflow
3. **Parameter Validation:** Check required parameters exist

### Content Generation
1. **Template Loading:** Load conversation-thread.json structure
2. **AI Processing:** Use discussion-moderator agent with template prompts
3. **Content Assembly:** Combine generated sections into final message

### Validation & Output
1. **Rule Application:** Check character limits, formatting requirements
2. **File Operations:** Save to communication/conversation/_inbox.md
3. **Response Formatting:** Return success/error status to user

## Error Handling Integration

```javascript
async executePipeline(context) {
  try {
    // Execute all phases
    for (const phase of this.phases) {
      const result = await this.executePhase(phase, context);
      if (result.error) {
        await this.handleError(result.error, phase);
        break;
      }
    }
  } catch (error) {
    // Use utilities for error logging
    await this.executeUtilities([{
      category: 'system',
      name: 'error-logger',
      args: [error.message]
    }]);
  }
}
```

## Scalability Considerations

### Adding New Message Types
1. Create new template in `templates/messaging/`
2. Add command in `commands/message/`
3. Extend workflow methods
4. Update agent guidelines if needed

### Multi-Platform Support
1. Add platform rules in `rules/platform/`
2. Create platform-specific templates
3. Update validation logic
4. Add platform-specific utilities

## Testing Integration

### Unit Testing
- Test individual workflow phases
- Validate template generation
- Check rule enforcement
- Test utility functions

### Integration Testing
- End-to-end command execution
- Multi-component interactions
- Error scenario handling
- Performance validation

This example demonstrates how all `.system` components work together to create a cohesive, extensible AI-powered messaging system.