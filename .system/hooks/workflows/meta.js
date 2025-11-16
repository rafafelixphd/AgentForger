const BaseWorkflow = require('./base');

class MetaWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata = {
      ...this.metadata,
      name: 'MetaWorkflow',
      description: 'Meta-level system commands and context management',
      supportedCommands: [
        'meta:context'
      ]
    };
  }

  isSupportedCommand(command) {
    return this.metadata.supportedCommands.includes(command);
  }

  async executeWorkflowPhase(context) {
    console.log('🔍 Meta workflow execution');

    if (context.command === 'meta:context') {
      return await this.handleContext(context);
    }
  }

  async handleContext(context) {
    const params = context.params;

    if (params.add) {
      // Add context
      this.orchestrator.context.push({
        command: context.command,
        content: params.add,
        timestamp: new Date().toISOString()
      });
      return {
        success: true,
        action: 'context_added',
        content: params.add
      };
    } else if (params.list) {
      // List context
      return {
        success: true,
        action: 'context_listed',
        context: this.orchestrator.context
      };
    } else if (params.clear) {
      // Clear context
      const clearedCount = this.orchestrator.context.length;
      this.orchestrator.context = [];
      return {
        success: true,
        action: 'context_cleared',
        clearedCount: clearedCount
      };
    } else {
      throw new Error('Specify --add, --list, or --clear for meta:context command');
    }
  }
}

module.exports = MetaWorkflow;