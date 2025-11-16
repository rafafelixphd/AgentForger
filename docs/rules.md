# Rules System

## Overview

Rules define validation constraints, platform requirements, and quality standards that are enforced during the validation phase of the pipeline.

## Rule Categories

### Platform Rules (`rules/platform/`)

Define platform-specific requirements:

```json
{
  "version": "1.0",
  "platform": "conversation",
  "characterLimits": {
    "message": 500,
    "thread": 1000
  },
  "contentRequirements": {
    "structure": {
      "required": true,
      "format": "thread_format"
    }
  },
  "validationChecks": [
    "character_limit",
    "format_validation"
  ]
}
```

### Validation Rules (`rules/validation/`)

Define quality and content rules:

```json
{
  "name": "content-rules",
  "rules": [
    {
      "id": "character_limit",
      "type": "constraint",
      "field": "length",
      "operator": "max",
      "value": 500,
      "message": "Content exceeds character limit"
    },
    {
      "id": "required_field",
      "type": "presence",
      "field": "topic",
      "message": "Topic parameter is required"
    }
  ]
}
```

## Rule Engine Integration

Rules are enforced through the validation phase:

```javascript
async executeValidationPhase(context) {
  const validation = await this.validateWithRules(['platform', 'content'], context);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  return validation;
}
```

## Creating New Rules

### 1. Define Rule Structure
```json
{
  "id": "unique_rule_id",
  "type": "constraint|presence|format",
  "field": "target_field",
  "operator": "max|min|equals|contains",
  "value": "expected_value",
  "message": "Error message when rule fails"
}
```

### 2. Add to Appropriate Category
- Platform rules: `rules/platform/platform-name.json`
- Validation rules: `rules/validation/category-rules.json`

### 3. Test Rule Enforcement
Rules are automatically applied during pipeline validation phases.