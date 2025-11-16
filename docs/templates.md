# Templates System

## Overview

Templates define structured output formats with AI prompts and content constraints. They ensure consistent, high-quality outputs across different categories.

## Template Structure

Templates are JSON files that define content generation patterns:

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
    },
    {
      "section": "section2",
      "type": "bullet_points",
      "maxChars": 300,
      "count": "2-3",
      "placeholder": "[Key points]",
      "aiPrompt": "Create 2-3 key points about: {topic}"
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

## Template Categories

### Content Templates (`templates/content/`)
For content creation and management:
- `linkedin-short.json` - LinkedIn posts
- `career-lessons.json` - Career advice content

### Research Templates (`templates/research/`)
For research analysis and synthesis:
- `academic-compact.json` - Academic summaries
- `market-compact.json` - Market analysis

### Messaging Templates (`templates/messaging/`)
For communication:
- `conversation-thread.json` - Conversation threads
- `linkedin-comment.json` - LinkedIn comments

## Template Integration

Templates are loaded and used in workflow phases:

```javascript
async executeWorkflowPhase(context) {
  const template = await this.loadTemplate('conversation-thread');
  const content = await this.generateContent(template, context.params);
  return { content };
}
```

## Creating New Templates

### 1. Define Template Structure
Choose appropriate category and create JSON file:
- Content: `templates/content/name.json`
- Research: `templates/research/name.json`
- Messaging: `templates/messaging/name.json`

### 2. Configure Sections
Each section defines:
- **type**: paragraph, bullet_points, sentence, etc.
- **maxChars**: Character limits
- **aiPrompt**: AI generation instructions
- **placeholder**: Human-readable description

### 3. Add Variations (Optional)
Enable multiple output variations:
```json
"variation": {
  "enabled": true,
  "strategy": "section-level",
  "sections": ["dynamic_section"]
}
```

### 4. Test Template
Templates are automatically available to commands that specify them via parameters.