const MessageWorkflow = require('../workflows/message');
const SystemWorkflow = require('../workflows/system');
const AgentWorkflow = require('../workflows/agent');
const MetaWorkflow = require('../workflows/meta');
const CriticWorkflow = require('../workflows/critic');
const fs = require('fs');
const path = require('path');

class Orchestrator {
  constructor() {
    this.workflows = new Map();
    this.settings = this.loadDefaultSettings();
    this.context = []; // Global context storage
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
    this.workflows.set('agent', new AgentWorkflow(this));
    this.workflows.set('meta', new MetaWorkflow(this));
    this.workflows.set('critic', new CriticWorkflow(this));

    console.log('✅ Orchestrator initialized');
  }

  async executeCommand(command, params = {}) {
    console.log(`🎯 Executing command: ${command}`);

    // Extract global parameters
    const globalParams = {};
    if (params.save) {
      globalParams.save = params.save;
      delete params.save;
    }
    if (params.context) {
      globalParams.context = params.context;
      // Also store in global context for persistence
      this.context.push({
        command: command,
        content: params.context,
        timestamp: new Date().toISOString()
      });
      console.log(`📝 Added context: ${params.context}`);
      delete params.context;
    }

    const [category] = command.split(':');
    const workflow = this.workflows.get(category);

    if (!workflow) {
      throw new Error(`No workflow found for category: ${category}`);
    }

    if (!workflow.isSupportedCommand(command)) {
      throw new Error(`Command not supported: ${command}`);
    }

    const context = { command, params, globalContext: this.context, ...globalParams };
    const result = await workflow.execute(context);

    // Handle automatic saving if --save specified
    if (context.save) {
      await this.savePipelineData(context.save, {
        command: context.command,
        params: context.params,
        globalParams,
        phaseResults: context.phaseResults || {},
        result,
        timestamp: new Date().toISOString()
      });
    }

    return result;
  }

  getWorkflowForCommand(command) {
    const [category] = command.split(':');
    return this.workflows.get(category);
  }

  async savePipelineData(filePath, data) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`💾 Pipeline data saved to: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to save pipeline data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Orchestrator;