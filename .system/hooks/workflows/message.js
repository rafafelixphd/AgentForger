const BaseWorkflow = require('./base');

class MessageWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata = {
      ...this.metadata,
      name: 'MessageWorkflow',
      description: 'Conversation message creation and reading workflow',
      supportedCommands: [
        'message:new',
        'message:read'
      ]
    };
  }

  isSupportedCommand(command) {
    return this.metadata.supportedCommands.includes(command);
  }

  async executeWorkflowPhase(context) {
    console.log('⚙️ Message workflow execution');

    if (context.command === 'message:new') {
      return await this.handleNewMessage(context);
    } else if (context.command === 'message:read') {
      return await this.handleReadMessages(context);
    }
  }

  async handleNewMessage(context) {
    // Create new message thread with agent routing
    const message = {
      content: context.params.message,
      to: context.params.to,
      timestamp: new Date().toISOString(),
      formattedContent: `Message: ${context.params.message} (to: ${context.params.to})`
    };

    return {
      success: true,
      action: 'created',
      message: message
    };
  }

  async handleReadMessages(context) {
    const count = context.params.count || 5;

    // Simulate reading messages
    const messages = [];
    for (let i = 0; i < count; i++) {
      messages.push({
        id: i + 1,
        content: `Sample message ${i + 1}`,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      action: 'read',
      messages: messages,
      count: count
    };
  }
}

module.exports = MessageWorkflow;