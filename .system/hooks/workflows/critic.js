const BaseWorkflow = require('./base');

class CriticWorkflow extends BaseWorkflow {
  constructor(orchestrator) {
    super(orchestrator);
    this.metadata.supportedCommands = [
      'critic:harsh',
      'critic:mentor',
      'critic:casual'
    ];
  }

  async executeInitializationPhase(context) {
    console.log('🔧 Initializing critic workflow...');

    // Determine personality from command
    const personality = context.command.split(':')[1];
    context.personality = personality;

    // Load appropriate agent
    await this.loadAgent(`${personality}-critic`);
    await this.loadTemplate('critic-report');

    return { status: 'initialized', personality };
  }

  async executeParametersPhase(context) {
    console.log('📋 Processing critic parameters...');

    // Validate required parameters
    if (!context.params.source) {
      throw new Error('Source parameter is required');
    }

    // Set defaults
    context.params.domain = context.params.domain || 'general';
    context.params.audience = context.params.audience || 'general';

    // Parse focus if provided
    if (context.params.focus) {
      context.params.focus = context.params.focus.split(',').map(f => f.trim());
    }

    // Load source content
    if (context.params.source.startsWith('/')) {
      // File path
      context.sourceContent = await this.readFile(context.params.source);
    } else {
      // Direct text
      context.sourceContent = context.params.source;
    }

    // Load comparison if provided
    if (context.params.compare) {
      context.previousCritique = await this.readFile(context.params.compare);
    }

    return { status: 'parameters_processed' };
  }

  async executeWorkflowPhase(context) {
    console.log('⚙️ Generating critique...');

    // Prepare content for AI
    const contentData = {
      content: context.sourceContent,
      domain: context.params.domain,
      focus: context.params.focus || [],
      audience: context.params.audience,
      personality: context.personality,
      previousCritique: context.previousCritique || null,
      userContext: context.context || null
    };

    // Generate critique using template and agent
    const critique = await this.generateContent(
      this.templates.get('critic-report'),
      contentData,
      this.agents.get(`${context.personality}-critic`)
    );

    context.critique = critique;
    return { status: 'critique_generated' };
  }

  async executeValidationPhase(context) {
    console.log('✅ Validating critique...');

    // Apply critic validation rules
    const validation = await this.validateWithRules(['critic'], {
      ...context.params,
      ...context.critique
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return { status: 'validated' };
  }

  async executeOutputPhase(context) {
    console.log('📤 Formatting critique output...');

    // Format the critique report
    const report = this.formatCritiqueReport(context.critique, context.params);

    // Save to file if requested (handled globally)
    // Return formatted result
    context.result = {
      personality: context.personality,
      domain: context.params.domain,
      report: report
    };

    return { status: 'output_formatted' };
  }

  formatCritiqueReport(critique, params) {
    let report = `# ${params.domain.toUpperCase()} CRITIQUE (${this.metadata.name})\n\n`;

    if (critique.metadata) {
      report += `**Metadata:** ${JSON.stringify(critique.metadata, null, 2)}\n\n`;
    }

    if (critique.overview) {
      report += `**Overview:** ${critique.overview}\n\n`;
    }

    if (critique.understanding) {
      report += `**What I Understood:** ${critique.understanding}\n\n`;
    }

    if (critique.critical_points && critique.critical_points.length > 0) {
      report += `**Critical Points:**\n`;
      critique.critical_points.forEach(point => {
        report += `- ${point}\n`;
      });
      report += '\n';
    }

    if (critique.positive_points && critique.positive_points.length > 0) {
      report += `**Positive Points:**\n`;
      critique.positive_points.forEach(point => {
        report += `- ${point}\n`;
      });
      report += '\n';
    }

    if (critique.questions && critique.questions.length > 0) {
      report += `**Questions for Clarification:**\n`;
      critique.questions.forEach(question => {
        report += `- ${question}\n`;
      });
      report += '\n';
    }

    if (critique.final_remarks && critique.final_remarks.length > 0) {
      report += `**Final Remarks:**\n`;
      critique.final_remarks.forEach(remark => {
        report += `- ${remark}\n`;
      });
      report += '\n';
    }

    return report;
  }
}

module.exports = CriticWorkflow;