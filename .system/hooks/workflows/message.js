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

  async executeValidationPhase(context) {
    console.log('✅ Validating message...');

    // Validate with message-specific rules
    const validation = await this.validateWithRules(['message'], context);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return validation;
  }

  async executeOutputPhase(context) {
    console.log('📤 Saving message...');

    if (context.command === 'message:new') {
      // Save message using message handler utility
      const result = await this.executeUtilities([{
        category: 'system',
        name: 'message-handler',
        args: [
          '--sender', 'user',
          '--message', context.result.message.content,
          '--target-agent', context.result.message.to,
          '--ai-response', 'true'
        ]
      }]);

      if (result[0] && result[0].success) {
        console.log('Message saved successfully');
      } else {
        console.log('Failed to save message');
      }
    }

    return context.result;
  }

  async handleNewMessage(context) {
    // Handle positional arguments for message
    let messageContent = context.params.message;
    if (!messageContent && context.args && context.args.length > 0) {
      messageContent = context.args.join(' ');
    }

    // Validate required message
    if (!messageContent) {
      throw new Error('Message content is required. Use --message "your message" or provide it as a positional argument.');
    }

    // Default agent if not specified
    const targetAgent = context.params.to || 'discussion-moderator';

    // Create new message thread with agent routing
    const message = {
      content: messageContent,
      to: targetAgent,
      timestamp: new Date().toISOString(),
      formattedContent: `Message: ${messageContent} (to: ${targetAgent})`
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