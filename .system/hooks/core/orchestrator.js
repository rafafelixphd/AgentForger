const MessageWorkflow = require('../workflows/message');
const SystemWorkflow = require('../workflows/system');
const EmailWorkflow = require('../workflows/email');
const OutputWorkflow = require('../workflows/output');
const AgentWorkflow = require('../workflows/agent');
const fs = require('fs');
const path = require('path');

class Orchestrator {
  constructor() {
    this.workflows = new Map();
    this.settings = this.loadDefaultSettings();
    this.initialize();
  }

  loadDefaultSettings() {
    const defaults = {
      activeAgent: 'discussion-moderator',
      verbosity: 'off',
      format: 'text'
    };

    // Try to load from output-standards.json
    try {
      const configPath = path.join(__dirname, '..', '..', 'configs', 'output-standards.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // Could load default formatting preferences here
        console.log('📋 Loaded output standards configuration');
      }
    } catch (error) {
      console.warn('⚠️ Could not load output standards config:', error.message);
    }

    // Try to load from performance-targets.json
    try {
      const perfPath = path.join(__dirname, '..', '..', 'configs', 'performance-targets.json');
      if (fs.existsSync(perfPath)) {
        const perfConfig = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
        // Could set performance monitoring thresholds here
        console.log('📊 Loaded performance targets configuration');
      }
    } catch (error) {
      console.warn('⚠️ Could not load performance targets config:', error.message);
    }

    return defaults;
  }

  async initialize() {
    console.log('🔧 Initializing Orchestrator...');

    // Load workflows
    this.workflows.set('message', new MessageWorkflow(this));
    this.workflows.set('system', new SystemWorkflow(this));
    this.workflows.set('email', new EmailWorkflow(this));
    this.workflows.set('output', new OutputWorkflow(this));
    this.workflows.set('agent', new AgentWorkflow(this));

    console.log('✅ Orchestrator initialized');
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