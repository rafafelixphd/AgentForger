const MessageWorkflow = require('../workflows/message');
const SystemWorkflow = require('../workflows/system');

class Orchestrator {
  constructor() {
    this.workflows = new Map();
    this.initialize();
  }

  async initialize() {
    console.log('🔧 Initializing Orchestrator...');

    // Load workflows
    this.workflows.set('message', new MessageWorkflow(this));
    this.workflows.set('system', new SystemWorkflow(this));

    console.log('✅ Orchestrator initialized');
  }

  async executeCommand(command, params = {}) {
    console.log(`🎯 Executing command: ${command}`);

    const [category] = command.split(':');
    const workflow = this.workflows.get(category);

    if (!workflow) {
      throw new Error(`No workflow found for category: ${category}`);
    }

    if (!workflow.isSupportedCommand(command)) {
      throw new Error(`Command not supported: ${command}`);
    }

    const context = { command, params };
    const result = await workflow.execute(context);

    return result;
  }

  getWorkflowForCommand(command) {
    const [category] = command.split(':');
    return this.workflows.get(category);
  }
}

module.exports = Orchestrator;