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
    const results = {};

    for (const phase of this.phases) {
      console.log(`🔄 Phase: ${phase}`);
      results[phase] = await this.executePhase(phase, context);
    }

    return results;
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

  async executeInitializationPhase(context) {
    console.log('🔧 Initialization phase');
    return { status: 'initialized' };
  }

  async executeParametersPhase(context) {
    console.log('📋 Parameters phase');
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
    return { status: 'output_formatted' };
  }
}

module.exports = BaseWorkflow;