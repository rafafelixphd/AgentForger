const BaseWorkflow = require('./base');

class OutputWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata = {
      ...this.metadata,
      name: 'OutputWorkflow',
      description: 'Controls output formatting and verbosity settings',
      supportedCommands: [
        'output:verbosity',
        'output:format'
      ]
    };
  }

  isSupportedCommand(command) {
    return this.metadata.supportedCommands.includes(command);
  }

  async executeWorkflowPhase(context) {
    console.log('📤 Output workflow execution');

    if (context.command === 'output:verbosity') {
      return await this.handleVerbosity(context);
    } else if (context.command === 'output:format') {
      return await this.handleFormat(context);
    }
  }

  async handleVerbosity(context) {
    const level = context.params.level;
    const validLevels = ['low', 'medium', 'high', 'off'];

    if (!validLevels.includes(level)) {
      throw new Error(`Invalid verbosity level. Valid options: ${validLevels.join(', ')}`);
    }

    // Store verbosity setting (in a real system, this would persist)
    this.orchestrator.settings = this.orchestrator.settings || {};
    this.orchestrator.settings.verbosity = level;

    const descriptions = {
      low: '~140 characters (concise)',
      medium: '~520 characters (balanced)',
      high: '~740 characters (detailed)',
      off: 'unrestricted length'
    };

    return {
      success: true,
      action: 'set_verbosity',
      level: level,
      description: descriptions[level]
    };
  }

  async handleFormat(context) {
    const type = context.params.type;
    const validTypes = ['json', 'markdown', 'text'];

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid format type. Valid options: ${validTypes.join(', ')}`);
    }

    // Store format setting
    this.orchestrator.settings = this.orchestrator.settings || {};
    this.orchestrator.settings.format = type;

    return {
      success: true,
      action: 'set_format',
      type: type
    };
  }
}

module.exports = OutputWorkflow;