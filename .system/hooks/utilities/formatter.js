#!/usr/bin/env node
// formatter.js - Output formatting utilities for pipeline results
// Provides standardized formatting for different output types and platforms

const fs = require('fs');
const path = require('path');

/**
 * Format output as JSON with proper structure
 */
function formatJson(data, pretty = true) {
    try {
        return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    } catch (error) {
        return JSON.stringify({ error: 'Failed to format JSON', details: error.message });
    }
}

/**
 * Format output as Markdown
 */
function formatMarkdown(data, title = 'Results') {
    if (typeof data !== 'object' || data === null) {
        return `# ${title}\n\n${data}`;
    }

    let markdown = `# ${title}\n\n`;

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            markdown += `## Item ${index + 1}\n\n`;
            if (typeof item === 'object') {
                markdown += formatObjectAsMarkdown(item);
            } else {
                markdown += `${item}\n\n`;
            }
        });
    } else {
        markdown += formatObjectAsMarkdown(data);
    }

    return markdown;
}

/**
 * Helper to format object as Markdown
 */
function formatObjectAsMarkdown(obj) {
    let markdown = '';

    for (const [key, value] of Object.entries(obj)) {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (typeof value === 'object' && value !== null) {
            markdown += `### ${formattedKey}\n\n`;
            if (Array.isArray(value)) {
                markdown += value.map(item =>
                    typeof item === 'object' ? `- ${formatObjectAsMarkdown(item)}` : `- ${item}`
                ).join('\n') + '\n\n';
            } else {
                markdown += formatObjectAsMarkdown(value);
            }
        } else {
            markdown += `- **${formattedKey}**: ${value}\n`;
        }
    }

    return markdown + '\n';
}

/**
 * Format output for terminal/console display
 */
function formatConsole(data, colors = true) {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    let output = '';

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            output += `${colors ? '\x1b[36m' : ''}Item ${index + 1}:${colors ? '\x1b[0m' : ''}\n`;
            output += formatObjectConsole(item, colors, 1) + '\n';
        });
    } else {
        output += formatObjectConsole(data, colors, 0);
    }

    return output;
}

/**
 * Helper to format object for console
 */
function formatObjectConsole(obj, colors = true, indent = 0) {
    const indentStr = '  '.repeat(indent);
    let output = '';

    for (const [key, value] of Object.entries(obj)) {
        const formattedKey = `${colors ? '\x1b[33m' : ''}${key}${colors ? '\x1b[0m' : ''}`;

        if (typeof value === 'object' && value !== null) {
            output += `${indentStr}${formattedKey}:\n`;
            if (Array.isArray(value)) {
                value.forEach((item, i) => {
                    output += `${indentStr}  ${colors ? '\x1b[32m' : ''}[${i}]${colors ? '\x1b[0m' : ''} `;
                    if (typeof item === 'object') {
                        output += '\n' + formatObjectConsole(item, colors, indent + 2);
                    } else {
                        output += `${item}\n`;
                    }
                });
            } else {
                output += formatObjectConsole(value, colors, indent + 1);
            }
        } else {
            output += `${indentStr}${formattedKey}: ${value}\n`;
        }
    }

    return output;
}

/**
 * Format validation results with status indicators
 */
function formatValidationResults(results) {
    const status = results.valid ? '✅ PASS' : '❌ FAIL';
    let output = `${status} - ${results.message || 'Validation completed'}\n\n`;

    if (results.errors && results.errors.length > 0) {
        output += 'Errors:\n';
        results.errors.forEach((error, index) => {
            output += `  ${index + 1}. ${error}\n`;
        });
        output += '\n';
    }

    if (results.warnings && results.warnings.length > 0) {
        output += 'Warnings:\n';
        results.warnings.forEach((warning, index) => {
            output += `  ${index + 1}. ${warning}\n`;
        });
        output += '\n';
    }

    if (results.details) {
        output += 'Details:\n';
        output += formatConsole(results.details, false);
    }

    return output;
}

/**
 * Format workflow execution summary
 */
function formatWorkflowSummary(workflow) {
    let output = `Workflow: ${workflow.name}\n`;
    output += `Status: ${workflow.status}\n`;
    output += `Duration: ${workflow.duration || 'N/A'}ms\n`;
    output += `Phase: ${workflow.currentPhase || 'N/A'}\n\n`;

    if (workflow.steps && workflow.steps.length > 0) {
        output += 'Execution Steps:\n';
        workflow.steps.forEach((step, index) => {
            const statusIcon = step.status === 'completed' ? '✅' :
                              step.status === 'failed' ? '❌' :
                              step.status === 'running' ? '🔄' : '⏳';
            output += `  ${statusIcon} ${step.name}: ${step.status}\n`;
            if (step.duration) {
                output += `      Duration: ${step.duration}ms\n`;
            }
            if (step.error) {
                output += `      Error: ${step.error}\n`;
            }
        });
    }

    return output;
}

/**
 * Format platform-specific output (LinkedIn, Conversation, etc.)
 */
function formatPlatformOutput(data, platform) {
    switch (platform.toLowerCase()) {
        case 'linkedin':
            return formatLinkedInOutput(data);
        case 'conversation':
            return formatConversationOutput(data);
        case 'twitter':
        case 'x':
            return formatTwitterOutput(data);
        default:
            return formatConsole(data);
    }
}

/**
 * Format for LinkedIn posting
 */
function formatLinkedInOutput(data) {
    if (typeof data === 'string') return data;

    let output = '';

    if (data.title) output += `${data.title}\n\n`;
    if (data.content) output += `${data.content}\n\n`;
    if (data.hashtags && Array.isArray(data.hashtags)) {
        output += data.hashtags.map(tag => `#${tag}`).join(' ') + '\n';
    }

    return output.trim();
}

/**
 * Format for conversation messaging
 */
function formatConversationOutput(data) {
    if (typeof data === 'string') return data;

    let output = '';

    if (data.title) output += `*${data.title}*\n\n`;
    if (data.content) output += `${data.content}\n\n`;
    if (data.attachments && Array.isArray(data.attachments)) {
        data.attachments.forEach(attachment => {
            output += `📎 ${attachment.title || attachment.filename}\n`;
        });
    }

    return output.trim();
}

/**
 * Format for Twitter/X posting
 */
function formatTwitterOutput(data) {
    if (typeof data === 'string') return data;

    let output = '';

    if (data.content) output += data.content;
    if (data.hashtags && Array.isArray(data.hashtags)) {
        const hashtags = data.hashtags.map(tag => `#${tag}`).join(' ');
        if (output.length + hashtags.length + 1 <= 280) {
            output += ` ${hashtags}`;
        }
    }

    // Truncate if too long
    if (output.length > 280) {
        output = output.substring(0, 277) + '...';
    }

    return output;
}

// Main execution logic
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
    case 'json':
        const jsonData = args[0] ? JSON.parse(args[0]) : {};
        const pretty = args[1] !== 'compact';
        console.log(formatJson(jsonData, pretty));
        break;

    case 'markdown':
        const mdData = args[0] ? JSON.parse(args[0]) : {};
        const title = args[1] || 'Results';
        console.log(formatMarkdown(mdData, title));
        break;

    case 'console':
        const consoleData = args[0] ? JSON.parse(args[0]) : {};
        const colors = args[1] !== 'no-colors';
        console.log(formatConsole(consoleData, colors));
        break;

    case 'validation':
        const validationData = args[0] ? JSON.parse(args[0]) : {};
        console.log(formatValidationResults(validationData));
        break;

    case 'workflow':
        const workflowData = args[0] ? JSON.parse(args[0]) : {};
        console.log(formatWorkflowSummary(workflowData));
        break;

    case 'platform':
        const platformData = args[0] ? JSON.parse(args[0]) : {};
        const platform = args[1] || 'console';
        console.log(formatPlatformOutput(platformData, platform));
        break;

    default:
        console.log('Usage: node formatter.js <command> [args...]');
        console.log('');
        console.log('Commands:');
        console.log('  json <data> [compact]          - Format as JSON');
        console.log('  markdown <data> [title]        - Format as Markdown');
        console.log('  console <data> [no-colors]     - Format for console');
        console.log('  validation <results>          - Format validation results');
        console.log('  workflow <workflow>           - Format workflow summary');
        console.log('  platform <data> <platform>     - Format for specific platform');
        console.log('');
        console.log('Examples:');
        console.log('  node formatter.js json \'{"name": "test"}\'');
        console.log('  node formatter.js markdown \'{"title": "Report", "content": "Details..."}\' "My Report"');
        process.exit(1);
}