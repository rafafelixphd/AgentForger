class BaseWorkflow {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.phases = ['initialization', 'parameters', 'workflow', 'validation', 'output'];
    this.metadata = {
      name: 'BaseWorkflow',
      version: '1.0.0',
      description: 'Base workflow implementation',
      supportedCommands: [],
      created: new Date().toISOString()
    };
  }

  async execute(context) {
    console.log(`🎯 Executing ${this.metadata.name} workflow`);

    try {
      // Execute pipeline phases
      const results = await this.executePipeline(context);
      return results;
    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }

  async executePipeline(context) {
    context.phaseResults = {};

    for (const phase of this.phases) {
      console.log(`🔄 Phase: ${phase}`);
      const result = await this.executePhase(phase, context);
      context.phaseResults[phase] = result;
    }

    return context.result || context.phaseResults;
  }

  async executePhase(phase, context) {
    const methodName = `execute${phase.charAt(0).toUpperCase() + phase.slice(1)}Phase`;

    if (this[methodName]) {
      return await this[methodName](context);
    } else {
      // Default implementation
      return { status: 'completed', phase };
    }
  }

  getContext(context) {
    // Return accumulated global context
    return context.globalContext || [];
  }

  isSupportedCommand(command) {
    return this.metadata.supportedCommands.includes(command);
  }

  async loadAgent(agentName) {
    // Stub - in real implementation, load from .system/agents/
    console.log(`Loading agent: ${agentName}`);
    this.agents = this.agents || new Map();
    this.agents.set(agentName, { name: agentName, loaded: true });
  }

  async loadTemplate(templateName) {
    // Stub - in real implementation, load from .system/templates/
    console.log(`Loading template: ${templateName}`);
    this.templates = this.templates || new Map();
    this.templates.set(templateName, { name: templateName, loaded: true });
  }

  async generateContent(template, params, agent) {
    // Stub - in real implementation, use AI to generate content
    console.log(`Generating content with template: ${template.name}, agent: ${agent.name}`);
    return {
      metadata: params,
      overview: 'Sample overview of the critique',
      understanding: 'Sample understanding summary',
      critical_points: ['Point 1', 'Point 2'],
      positive_points: ['Positive 1', 'Positive 2'],
      questions: ['Question 1'],
      final_remarks: ['Remark 1']
    };
  }

  async validateWithRules(ruleSets, data) {
    // Stub - in real implementation, apply validation rules
    console.log(`Validating with rules: ${ruleSets.join(', ')}`);
    return { valid: true, errors: [] };
  }

  async readFile(path) {
    // Stub - in real implementation, read file
    console.log(`Reading file: ${path}`);
    return 'Sample file content';
  }

  async executeInitializationPhase(context) {
    console.log('🔧 Initialization phase');
    return { status: 'initialized' };
  }

  async executeParametersPhase(context) {
    console.log('📋 Parameters phase');

    // Validate global parameters
    if (context.save) {
      if (!context.save.startsWith('/') || !context.save.endsWith('.json')) {
        throw new Error('Save path must be absolute and end with .json');
      }
    }
    if (context.context && context.context.length > 1000) {
      throw new Error('Context must be less than 1000 characters');
    }

    return { status: 'parameters_processed', params: context.params };
  }

  async executeWorkflowPhase(context) {
    console.log('⚙️ Workflow phase - override in subclass');
    return { status: 'workflow_completed' };
  }

  async executeValidationPhase(context) {
    console.log('✅ Validation phase');
    return { status: 'validated' };
  }

  async executeOutputPhase(context) {
    console.log('📤 Output phase');
    // Subclasses should set context.result here
    return { status: 'output_formatted' };
  }
}

module.exports = BaseWorkflow;