# Hooks System (Pipeline Execution)

## Overview

Hooks provide the modular pipeline execution system that processes all commands through a consistent 5-phase workflow.

## Core Components

### Orchestrator (`hooks/core/orchestrator.js`)
Central command router that coordinates the entire pipeline:

```javascript
class Orchestrator {
  constructor() {
    this.workflows = new Map();
    this.rules = new Map();
    this.utilities = new Map();
  }

  async executeCommand(command, params) {
    const workflow = this.getWorkflowForCommand(command);
    return await workflow.execute({ command, params });
  }
}
```

### Phase Manager (`hooks/core/phase-manager.js`)
Manages execution of individual pipeline phases and error handling.

### Base Workflow (`hooks/workflows/base.js`)
Abstract base class that all workflows extend:

```javascript
class BaseWorkflow {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.phases = ['initialization', 'parameters', 'workflow', 'validation', 'output'];
  }

  async execute(context) {
    for (const phase of this.phases) {
      await this.executePhase(phase, context);
    }
  }
}
```

## Category Workflows

Each category has a dedicated workflow class:

### Content Workflow (`hooks/workflows/content.js`)
```javascript
class ContentWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = [
      'content:new', 'content:improve', 'content:validate'
    ];
  }
}
```

### Research Workflow (`hooks/workflows/research.js`)
```javascript
class ResearchWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = [
      'research:new', 'research:analyze', 'research:synthesize'
    ];
  }
}
```

### Message Workflow (`hooks/workflows/message.js`)
```javascript
class MessageWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = [
      'message:new', 'message:read'
    ];
  }
}
```

## Pipeline Phases

### 1. Initialization Phase
Setup and validation:
```javascript
async executeInitializationPhase(context) {
  console.log('🔧 Initializing...');
  // Load required utilities
  // Validate command parameters
}
```

### 2. Parameters Phase
Input processing and validation:
```javascript
async executeParametersPhase(context) {
  console.log('📋 Processing parameters...');
  // Parse and validate inputs
  // Set default values
}
```

### 3. Workflow Phase
Core execution logic:
```javascript
async executeWorkflowPhase(context) {
  console.log('⚙️ Executing workflow...');
  // Main business logic
  // AI processing
  // Content generation
}
```

### 4. Validation Phase
Quality assurance and rule enforcement:
```javascript
async executeValidationPhase(context) {
  console.log('✅ Validating...');
  // Apply rules
  // Quality checks
  // Constraint validation
}
```

### 5. Output Phase
Result formatting and delivery:
```javascript
async executeOutputPhase(context) {
  console.log('📤 Formatting output...');
  // Structure results
  // Save to files
  // Return response
}
```

## Rules Engine (`hooks/rules/`)

Validation rules integrated into workflows:

- `base.js` - Common validation logic
- `validation.js` - Content quality rules
- `platform.js` - Platform-specific constraints
- `agents.js` - Agent capability validation

## Creating New Workflows

### 1. Extend BaseWorkflow
```javascript
const BaseWorkflow = require('./base');

class NewWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = ['new:command'];
  }

  async executeWorkflowPhase(context) {
    // Implement your logic
    return { result: 'success' };
  }
}
```

### 2. Register with Orchestrator
```javascript
// In orchestrator.js
const NewWorkflow = require('../workflows/new');
this.workflows.set('new', new NewWorkflow(this));
```

### 3. Implement Phase Methods
Override any phase methods that need custom logic while maintaining the pipeline structure.