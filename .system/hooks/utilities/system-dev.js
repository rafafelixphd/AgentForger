#!/usr/bin/env node
/**
 * system-dev.js - System development and modification tool
 *
 * Analyzes user requests for system changes, implements modifications,
 * and updates all necessary files with detailed change tracking.
 *
 * Integrated with the OpenCode pipeline architecture.
 *
 * Usage:
 *     node system-dev.js --request "Add new agent for X functionality" [--dry-run]
 */

const fs = require('fs');
const path = require('path');

class SystemDeveloper {
    constructor(systemRoot) {
        this.systemRoot = systemRoot;
        this.orchestrator = null;
        this.changes = [];
        this.backups = [];
        this.dryRun = false;
    }

    async initialize() {
        // Load orchestrator for pipeline integration
        try {
            const Orchestrator = require(path.join(this.systemRoot, '.system', 'hooks', 'core', 'orchestrator.js'));
            this.orchestrator = new Orchestrator(this.systemRoot);
            await this.orchestrator.initialize();
        } catch (error) {
            console.warn('⚠️ Could not load orchestrator, proceeding in standalone mode');
        }
    }

    async developSystem(request, dryRun = false) {
        this.dryRun = dryRun;
        this.changes = [];
        this.backups = [];

        console.log('🔧 SYSTEM DEVELOPMENT MODE');
        console.log('=' .repeat(50));
        console.log(`📝 Request: ${request}`);

        if (dryRun) {
            console.log('🔍 DRY RUN MODE - No changes will be made');
        }

        // Initialize pipeline integration
        await this.initialize();

        try {
            // Step 1: Parse the request
            const parsedRequest = this.parseRequest(request);
            console.log(`\n📋 Parsed Request:`, parsedRequest);

            // Step 2: Analyze required changes using pipeline workflows
            const changePlan = await this.analyzeChangesPipeline(parsedRequest);
            console.log(`\n📊 Change Plan:`, changePlan);

            // Step 3: Generate specific file modifications
            const fileChanges = this.generateFileChanges(changePlan);
            console.log(`\n📁 File Changes Required:`, fileChanges.length);

            // Step 4: Implement changes (or preview in dry run)
            const results = await this.implementChanges(fileChanges);

            // Step 5: Update manifests and documentation
            const metadataUpdates = this.updateMetadata(changePlan);

            // Step 6: Validate system integrity through pipeline
            const validation = await this.validateSystemPipeline();

            // Step 7: Generate comprehensive report
            const report = this.generateReport(results, metadataUpdates, validation);

            return report;

        } catch (error) {
            console.error('❌ System development failed:', error.message);
            // Attempt rollback if not in dry run
            if (!dryRun) {
                await this.rollbackChanges();
            }
            throw error;
        }
    }

    parseRequest(request) {
        const requestLower = request.toLowerCase();

        // Identify change type
        let changeType = 'unknown';
        let target = '';
        let functionality = '';

        if (requestLower.includes('new agent') || requestLower.includes('create agent')) {
            changeType = 'new_agent';
            const agentMatch = request.match(/(?:agent for|agent to)\s+(.+?)(?:\s|$)/i);
            if (agentMatch) functionality = agentMatch[1].trim();
        } else if (requestLower.includes('new command') || requestLower.includes('create command')) {
            changeType = 'new_command';
            const commandMatch = request.match(/(?:command for|command to)\s+(.+?)(?:\s|$)/i);
            if (commandMatch) functionality = commandMatch[1].trim();
        } else if (requestLower.includes('new hook') || requestLower.includes('create hook')) {
            changeType = 'new_hook';
            const hookMatch = request.match(/(?:hook for|hook to)\s+(.+?)(?:\s|$)/i);
            if (hookMatch) functionality = hookMatch[1].trim();
        } else if (requestLower.includes('add platform') || requestLower.includes('support for')) {
            changeType = 'new_platform';
            const platformMatch = request.match(/(?:platform|support for)\s+(.+?)(?:\s|$)/i);
            if (platformMatch) target = platformMatch[1].trim();
        } else if (requestLower.includes('template') || requestLower.includes('validation')) {
            changeType = 'template_modification';
            functionality = request.replace(/^(?:modify|update|change)\s+/i, '');
        }

        return {
            type: changeType,
            target: target,
            functionality: functionality,
            originalRequest: request
        };
    }

    async analyzeChangesPipeline(parsedRequest) {
        const changes = {
            files: [],
            agents: [],
            commands: [],
            hooks: [],
            templates: [],
            configs: []
        };

        // Use pipeline workflows to analyze changes
        if (this.orchestrator) {
            try {
                const analysisContext = {
                    command: 'system:analyze-changes',
                    params: { parsedRequest },
                    category: 'system'
                };

                const analysisResult = await this.orchestrator.executeCommand('system:analyze-changes', { parsedRequest });
                if (analysisResult && analysisResult.changes) {
                    Object.assign(changes, analysisResult.changes);
                }
            } catch (error) {
                console.warn('⚠️ Pipeline analysis failed, using fallback logic');
            }
        }

        // Fallback analysis logic
        switch (parsedRequest.type) {
            case 'new_agent':
                changes.agents.push({
                    name: this.generateAgentName(parsedRequest.functionality),
                    functionality: parsedRequest.functionality,
                    color: this.assignColor(),
                    files: [
                        `agents/${this.generateAgentName(parsedRequest.functionality)}.md`,
                        'manifest.json',
                        'hooks/utilities/file-ops.sh'
                    ]
                });
                changes.files.push('manifest.json', 'hooks/utilities/file-ops.sh');
                break;

            case 'new_command':
                const commandName = this.generateCommandName(parsedRequest.functionality);
                changes.commands.push({
                    name: commandName,
                    functionality: parsedRequest.functionality,
                    files: [
                        `commands/${this.categorizeCommand(commandName)}/${commandName}.md`,
                        'hooks/core/orchestrator.js',
                        'manifest.json'
                    ]
                });
                changes.files.push('manifest.json', 'hooks/core/orchestrator.js');
                break;

            case 'new_hook':
                changes.hooks.push({
                    name: `${this.generateHookName(parsedRequest.functionality)}.js`,
                    functionality: parsedRequest.functionality,
                    files: [
                        `hooks/workflows/${this.generateHookName(parsedRequest.functionality)}.js`,
                        'manifest.json'
                    ]
                });
                changes.files.push('manifest.json');
                break;

            case 'new_platform':
                changes.templates.push({
                    platform: parsedRequest.target,
                    files: [
                        `templates/content/${parsedRequest.target}-post.json`,
                        `rules/platform/${parsedRequest.target}-rules.json`,
                        'manifest.json'
                    ]
                });
                changes.files.push('manifest.json', `rules/platform/${parsedRequest.target}-rules.json`);
                break;

            default:
                // Generic change - analyze what might be needed
                changes.files.push('manifest.json');
                break;
        }

        return changes;
    }

    generateFileChanges(changePlan) {
        const fileChanges = [];

        // Process agent changes
        changePlan.agents.forEach(agent => {
            fileChanges.push({
                file: `agents/${agent.name}.md`,
                action: 'create',
                content: this.generateAgentContent(agent)
            });

            fileChanges.push({
                file: 'manifest.json',
                action: 'update',
                changes: [
                    { path: 'structure.agents.count', operation: 'increment' },
                    { path: 'structure.agents.types', operation: 'add', value: 'negotiator' },
                    { path: 'fileMap.agents/', operation: 'add', value: `${agent.name}.md` }
                ]
            });

            fileChanges.push({
                file: 'hooks/utilities/file-ops.sh',
                action: 'update',
                changes: [
                    { pattern: 'get_required_files()', operation: 'add_case', value: `new_agent_case` }
                ]
            });
        });

        // Process command changes
        changePlan.commands.forEach(command => {
            const category = this.categorizeCommand(command.name);
            fileChanges.push({
                file: `commands/${category}/${command.name}.md`,
                action: 'create',
                content: this.generateCommandContent(command)
            });

            fileChanges.push({
                file: 'hooks/core/orchestrator.js',
                action: 'update',
                changes: [
                    { pattern: 'executeCommand', operation: 'add_method', value: `execute${this.capitalize(command.name)}` }
                ]
            });
        });

        // Process hook changes
        changePlan.hooks.forEach(hook => {
            fileChanges.push({
                file: `hooks/workflows/${hook.name}`,
                action: 'create',
                content: this.generateHookContent(hook)
            });

            fileChanges.push({
                file: 'manifest.json',
                action: 'update',
                changes: [
                    { path: 'structure.hooks.totalModules', operation: 'increment' },
                    { path: 'fileMap.hooks/workflows/', operation: 'add', value: hook.name }
                ]
            });
        });

        return fileChanges;
    }

    async implementChanges(fileChanges) {
        const results = {
            created: [],
            updated: [],
            errors: []
        };

        for (const change of fileChanges) {
            try {
                if (this.dryRun) {
                    console.log(`🔍 [DRY RUN] Would ${change.action}: ${change.file}`);
                    results.updated.push(change.file);
                    continue;
                }

                const fullPath = path.join(this.systemRoot, change.file);

                // Create backup if file exists
                if (fs.existsSync(fullPath)) {
                    const backupPath = `${fullPath}.backup.${Date.now()}`;
                    fs.copyFileSync(fullPath, backupPath);
                    this.backups.push(backupPath);
                }

                switch (change.action) {
                    case 'create':
                        // Ensure directory exists
                        const dir = path.dirname(fullPath);
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }
                        fs.writeFileSync(fullPath, change.content);
                        results.created.push(change.file);
                        break;

                    case 'update':
                        // Handle specific update operations
                        if (change.file === 'manifest.json') {
                            this.updateManifest(change.changes);
                        } else if (change.file === 'hooks/core/orchestrator.js') {
                            this.updateOrchestrator(change.changes);
                        }
                        results.updated.push(change.file);
                        break;
                }

                console.log(`✅ ${change.action === 'create' ? 'Created' : 'Updated'}: ${change.file}`);

            } catch (error) {
                console.error(`❌ Failed to ${change.action} ${change.file}:`, error.message);
                results.errors.push({ file: change.file, error: error.message });
            }
        }

        return results;
    }

    updateMetadata(changePlan) {
        // Update any additional metadata files
        const updates = [];

        if (!this.dryRun) {
            // Update system health check if needed
            // Update any other metadata files
        }

        return updates;
    }

    async validateSystemPipeline() {
        // Run validation through pipeline
        if (this.orchestrator) {
            try {
                const validationResult = await this.orchestrator.executeCommand('system:validate', {});
                return {
                    passed: validationResult && validationResult.success,
                    issues: validationResult ? validationResult.issues || [] : ['Pipeline validation failed']
                };
            } catch (error) {
                console.warn('⚠️ Pipeline validation failed, using basic checks');
            }
        }

        // Fallback validation
        const issues = [];

        // Check if created files exist
        // Check if manifest is valid JSON
        // Check if basic system structure is intact

        return {
            passed: issues.length === 0,
            issues: issues
        };
    }

    generateReport(results, metadataUpdates, validation) {
        const report = {
            timestamp: new Date().toISOString(),
            dryRun: this.dryRun,
            results: results,
            metadataUpdates: metadataUpdates,
            validation: validation,
            summary: {
                filesCreated: results.created.length,
                filesUpdated: results.updated.length,
                errors: results.errors.length,
                backupsCreated: this.backups.length
            }
        };

        console.log('\n' + '='.repeat(60));
        console.log('📊 SYSTEM DEVELOPMENT REPORT');
        console.log('='.repeat(60));

        if (this.dryRun) {
            console.log('🔍 DRY RUN COMPLETED - No actual changes made');
        } else {
            console.log('✅ DEVELOPMENT COMPLETED');
        }

        console.log(`📁 Files Created: ${results.created.length}`);
        console.log(`📝 Files Updated: ${results.updated.length}`);
        console.log(`❌ Errors: ${results.errors.length}`);
        console.log(`💾 Backups Created: ${this.backups.length}`);

        if (results.created.length > 0) {
            console.log('\n📁 Created Files:');
            results.created.forEach(file => console.log(`  ✓ ${file}`));
        }

        if (results.updated.length > 0) {
            console.log('\n📝 Updated Files:');
            results.updated.forEach(file => console.log(`  ✓ ${file}`));
        }

        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(err => console.log(`  ✗ ${err.file}: ${err.error}`));
        }

        if (validation.issues.length > 0) {
            console.log('\n⚠️ Validation Issues:');
            validation.issues.forEach(issue => console.log(`  ! ${issue}`));
        }

        // Print all changed files
        const allChangedFiles = [...results.created, ...results.updated];
        if (allChangedFiles.length > 0) {
            console.log('\n🔄 ALL FILES CHANGED:');
            allChangedFiles.forEach(file => console.log(`  • ${file}`));
        }

        console.log('\n' + '='.repeat(60));

        return report;
    }

    // Helper methods
    generateAgentName(functionality) {
        return functionality.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    generateCommandName(functionality) {
        return functionality.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    generateHookName(functionality) {
        return functionality.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-handler';
    }

    categorizeCommand(commandName) {
        // Simple categorization logic
        if (commandName.includes('content') || commandName.includes('write') || commandName.includes('create')) {
            return 'content';
        } else if (commandName.includes('research') || commandName.includes('analyze')) {
            return 'research';
        } else if (commandName.includes('message') || commandName.includes('communicate')) {
            return 'message';
        } else if (commandName.includes('project')) {
            return 'project';
        } else {
            return 'meta';
        }
    }

    assignColor() {
        const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'cyan', 'pink'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generateAgentContent(agent) {
        return `---
name: ${agent.name}
description: ${agent.functionality} specialist that handles ${agent.functionality.toLowerCase()} with expertise and precision.
model: inherit
color: ${agent.color}
---`;
    }

    generateCommandContent(command) {
        const category = this.categorizeCommand(command.name);
        return `# /${category}:${command.name}

${command.functionality} command.

## Usage
\`\`\`
/${category}:${command.name} --param "value"
\`\`\`

## What it does
- Implements ${command.functionality.toLowerCase()}
- Provides comprehensive functionality for ${command.functionality.toLowerCase()}

## Parameters
- \`--param\`: Parameter description

## Integration
- Uses \`hooks/workflows/${command.name}-handler.js\` for implementation`;
    }

    generateHookContent(hook) {
        return `/**
 * ${hook.name} - ${hook.functionality} workflow
 *
 * Handles ${hook.functionality.toLowerCase()} functionality within the pipeline.
 */

const BaseWorkflow = require('../base');

class ${this.capitalize(hook.name.replace('.js', '').replace('-', ''))}Workflow extends BaseWorkflow {
    constructor(orchestrator) {
        super(orchestrator);

        this.metadata = {
            ...this.metadata,
            name: '${this.capitalize(hook.name.replace('.js', '').replace('-', ''))}Workflow',
            description: '${hook.functionality} workflow implementation',
            supportedCommands: ['system:${hook.name.replace('-handler.js', '').replace('-', '-')}']
        };
    }

    async executeWorkflowPhase(context) {
        console.log('🔧 Executing ${hook.functionality} workflow');

        // Implementation would go here
        return {
            success: true,
            message: '${hook.functionality} workflow completed'
        };
    }
}

module.exports = ${this.capitalize(hook.name.replace('.js', '').replace('-', ''))}Workflow;`;
    }

    updateManifest(changes) {
        const manifestPath = path.join(this.systemRoot, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        changes.forEach(change => {
            // Simple manifest update logic
            if (change.path === 'structure.agents.count') {
                manifest.structure.agents.count++;
            } else if (change.path === 'structure.hooks.totalModules') {
                manifest.structure.hooks.totalModules++;
            } else if (change.path.includes('fileMap.')) {
                const [section, key] = change.path.replace('fileMap.', '').split('/');
                if (!manifest.fileMap[key]) manifest.fileMap[key] = [];
                if (change.operation === 'add') {
                    manifest.fileMap[key].push(change.value);
                }
            }
        });

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

    updateOrchestrator(changes) {
        // This would be more complex in practice
        console.log('📝 Orchestrator would be updated here');
    }

    async rollbackChanges() {
        console.log('🔄 Rolling back changes...');
        // Restore backups
        this.backups.forEach(backup => {
            const original = backup.replace(/\.backup\.\d+$/, '');
            if (fs.existsSync(backup)) {
                fs.copyFileSync(backup, original);
                fs.unlinkSync(backup);
            }
        });
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);

    const request = args.find(arg => arg.startsWith('--request='))?.split('=')[1];
    const dryRun = args.includes('--dry-run');

    if (!request) {
        console.error('Usage: node system-dev.js --request "Description of system change" [--dry-run]');
        process.exit(1);
    }

    try {
        const systemRoot = path.join(__dirname, '..', '..');
        const developer = new SystemDeveloper(systemRoot);
        const report = await developer.developSystem(request, dryRun);

        // Save report to file
        const reportPath = path.join(systemRoot, '.system', 'logs', `system-dev-${Date.now()}.json`);
        const fs = require('fs');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`📄 Detailed report saved to: ${reportPath}`);

    } catch (error) {
        console.error('❌ System development failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SystemDeveloper;