# Category:Action Pattern

## Overview

The `.system` architecture uses a modular `/category:action` command pattern that enables extensible AI-powered workflows.

## The Pattern

### Structure
```
/category:action [parameters]
```

**Examples:**
- `/content:new --topic "AI Ethics"`
- `/research:analyze --depth deep`
- `/message:reply --context "previous-message"`

### Categories
Categories represent functional domains:
- `content` - Content creation and management
- `research` - Research gathering and analysis
- `message` - Communication and messaging
- `system` - System management and diagnostics

### Actions
Actions define specific operations within categories:
- `new` - Create new items
- `analyze` - Perform analysis
- `validate` - Quality assurance
- `improve` - Enhancement operations

## Simple Command Structure

### Basic Command Creation

**1. Create Command Documentation**
```markdown
# /category:action

Brief description.

## Usage
```
category:action --param value
```

## Parameters
- `--param`: Description

## Examples
```
category:action --param "example"
```
```

**2. Add to Existing Workflow**
```javascript
// In hooks/workflows/category.js
this.metadata.supportedCommands.push('category:action');

// Add implementation method
async executeActionPhase(context) {
  // Your logic here
  return { result: 'success' };
}
```

**3. Register with Orchestrator**
```javascript
// In hooks/core/orchestrator.js
// Usually already registered for existing categories
```

## Creating Rules

### Rule Categories

Rules are organized by type in `rules/`:

#### Platform Rules
Define platform-specific requirements in `rules/platform/`:
```json
{
  "version": "1.0",
  "platform": "newplatform",
  "characterLimits": {
    "textPost": 3000,
    "comment": 500
  },
  "contentRequirements": {
    "hook": {
      "required": true,
      "maxLength": 100
    }
  },
  "validationChecks": [
    "character_limit",
    "platform_formatting"
  ]
}
```

#### Validation Rules
Define quality and content rules in `rules/validation/`:
```json
{
  "name": "content-rules",
  "rules": [
    {
      "id": "character_limit",
      "type": "constraint",
      "field": "length",
      "operator": "max",
      "value": 280,
      "message": "Content exceeds character limit"
    }
  ]
}
```

### Rule Engine Integration

Rules are enforced through the validation phase in workflows:
```javascript
async executeValidationPhase(context) {
  const validation = await this.validateWithRules(['content'], context);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
}
```

## Creating Templates

### Template Structure

Templates define structured output formats in `templates/category/`:
```json
{
  "name": "Template Name",
  "platform": "platform-name",
  "type": "content-type",
  "description": "Template description",
  "constraints": {
    "maxChars": 500,
    "sections": ["section1", "section2"]
  },
  "structure": [
    {
      "section": "section1",
      "type": "paragraph",
      "maxChars": 200,
      "placeholder": "[Section content]",
      "aiPrompt": "Generate content for section 1 about: {topic}"
    }
  ],
  "variation": {
    "enabled": true,
    "strategy": "section-level",
    "sections": ["section1"]
  },
  "formatting": {
    "separator": "\n\n",
    "platformRules": ["rule1", "rule2"]
  }
}
```

### Template Integration

Templates are used in workflow phases:
```javascript
async executeWorkflowPhase(context) {
  const template = await this.loadTemplate('template-name');
  const content = await this.generateContent(template, context.params);
  return { content };
}
```

## Creating Utilities

### Utility Categories

Utilities provide reusable functionality in `hooks/utilities/`:

#### Text Utilities (`text/`)
```bash
# word-counter.sh
#!/bin/bash
# Count words in text
echo "$1" | wc -w
```

#### File Utilities (`file/`)
```bash
# file-ops.sh
#!/bin/bash
# File operations helper
cp "$1" "$2"
```

#### System Utilities (`system/`)
```bash
# system-health.sh
#!/bin/bash
# System diagnostics
ps aux | grep node | wc -l
```

### Python Utilities
```python
# validator.py
def validate_content(content, rules):
    """Validate content against rules"""
    errors = []
    for rule in rules:
        if not check_rule(content, rule):
            errors.append(rule['message'])
    return {'valid': len(errors) == 0, 'errors': errors}
```

### Utility Integration

Utilities are called from workflows:
```javascript
const utilities = [
  { category: 'text', name: 'formatter' },
  { category: 'file', name: 'reader', args: ['path/to/file'] }
];

const results = await this.executeUtilities(utilities);
```

## Integration Points

### Orchestrator Registration

Register new components in `hooks/core/orchestrator.js`:
```javascript
// Load workflows
await this.loadWorkflows();
// Load rules
await this.loadRules();
// Load utilities
await this.loadUtilities();

// Register new workflow
this.workflows.set('newcategory', new NewCategoryWorkflow(this));
```

### Command Routing

Commands are routed through the orchestrator:
```javascript
async executeCommand(command, params) {
  const workflow = this.getWorkflowForCommand(command);
  return await workflow.execute({ command, params });
}
```

### Pipeline Execution

All commands follow the 5-phase pipeline:
1. **Initialization** - Setup and validation
2. **Parameters** - Input processing
3. **Workflow** - Core execution
4. **Validation** - Quality assurance
5. **Output** - Result formatting

## Best Practices

### 1. Modularity
- Keep components focused on single responsibilities
- Use inheritance for shared functionality
- Follow established naming conventions

### 2. Error Handling
- Implement comprehensive error handling
- Provide meaningful error messages
- Support graceful degradation

### 3. Testing
- Test each phase independently
- Validate integration points
- Test error conditions

### 4. Documentation
- Document all parameters and options
- Provide usage examples
- Maintain API consistency

### 5. Extensibility
- Design for future extensions
- Use configuration over code changes
- Maintain backward compatibility

## Example: Creating a New Category

Let's create a `design` category for design-related tasks:

### 1. Create Command Structure
```bash
mkdir .system/commands/design
echo "# /design:concept\n\nGenerate design concepts" > .system/commands/design/concept.md
```

### 2. Create Agent
```markdown
---
name: design-critic
description: Design critique and feedback specialist
inherits_from: ego
---
```

### 3. Create Workflow
```javascript
class DesignWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = ['design:concept'];
  }
}
```

### 4. Create Template
```json
{
  "name": "Design Concept",
  "platform": "design",
  "type": "concept",
  "structure": [
    {
      "section": "overview",
      "aiPrompt": "Generate design concept for: {topic}"
    }
  ]
}
```

### 5. Register Components
Update orchestrator to load the new workflow and register command routing.

This modular architecture allows seamless extension while maintaining consistency across all categories and actions.