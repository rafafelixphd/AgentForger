const BaseWorkflow = require('./base');
const fs = require('fs');
const path = require('path');

class AgentWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata = {
      ...this.metadata,
      name: 'AgentWorkflow',
      description: 'Manages agent switching and status',
      supportedCommands: [
        'agent:switch',
        'agent:status',
        'agent:list',
        'agent:reset'
      ]
    };
  }

  isSupportedCommand(command) {
    return this.metadata.supportedCommands.includes(command);
  }

  async executeWorkflowPhase(context) {
    console.log('🤖 Agent workflow execution');

    if (context.command === 'agent:switch') {
      return await this.handleSwitch(context);
    } else if (context.command === 'agent:status') {
      return await this.handleStatus(context);
    } else if (context.command === 'agent:list') {
      return await this.handleList(context);
    } else if (context.command === 'agent:reset') {
      return await this.handleReset(context);
    }
  }

  async handleSwitch(context) {
    const agentName = context.params.name;

    if (!agentName) {
      throw new Error('Agent name is required. Use --name "agent-name"');
    }

    // Check if agent exists
    const agentPath = path.join('.system', 'agents', `${agentName}.md`);
    if (!fs.existsSync(agentPath)) {
      throw new Error(`Agent "${agentName}" not found`);
    }

    // Store active agent
    this.orchestrator.settings = this.orchestrator.settings || {};
    this.orchestrator.settings.activeAgent = agentName;

    return {
      success: true,
      action: 'switched_agent',
      agent: agentName
    };
  }

  async handleStatus(context) {
    const settings = this.orchestrator.settings || {};
    const activeAgent = settings.activeAgent || 'discussion-moderator'; // default
    const verbosity = settings.verbosity || 'off';
    const format = settings.format || 'text';

    return {
      success: true,
      action: 'status',
      activeAgent: activeAgent,
      verbosity: verbosity,
      format: format
    };
  }

  async handleList(context) {
    const agentsDir = path.join('.system', 'agents');
    const agents = [];

    if (fs.existsSync(agentsDir)) {
      const files = fs.readdirSync(agentsDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const agentName = file.replace('.md', '');
          const filePath = path.join(agentsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const descriptionMatch = content.match(/description: (.+)/);
          const description = descriptionMatch ? descriptionMatch[1] : 'No description';
          agents.push({ name: agentName, description: description });
        }
      });
    }

    return {
      success: true,
      action: 'list_agents',
      agents: agents
    };
  }

  async handleReset(context) {
    // Reset settings to defaults
    this.orchestrator.settings = {
      activeAgent: 'discussion-moderator',
      verbosity: 'off',
      format: 'text'
    };

    return {
      success: true,
      action: 'reset',
      message: 'Agent settings reset to defaults'
    };
  }
}

module.exports = AgentWorkflow;