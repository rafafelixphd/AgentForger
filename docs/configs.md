# Configuration System

The Agent Forger system uses a comprehensive configuration framework to manage AI behavior, output standards, and performance targets. All configuration files are located in `.system/configs/` and follow JSON format for easy parsing and modification.

## Configuration Files

### AI Context (`ai-context.json`)

Defines the AI system's operational context, behavioral guidelines, and environmental awareness.

**Key Sections:**
- **System Identity**: Core purpose and philosophy
- **Architecture**: Pipeline and workflow definitions
- **AI Guidelines**: Interaction style and output format standards
- **Context Awareness**: System role and operational environment
- **Operational Context**: Key directories and file patterns
- **Behavior Rules**: What to never assume and always verify
- **System Capabilities**: Available features and tools

**Usage**: Provides context for AI agents to understand their role and operational boundaries.

### Output Standards (`output-standards.json`)

Defines formatting standards for system output, user interface elements, and content structure.

**Key Sections:**
- **Pipeline Formatting**: Phase indicators, status symbols, progress formats
- **Content Structure**: How commands, results, and errors are displayed
- **Validation Output**: Score formats, issue reporting, threshold indicators
- **Progress Reporting**: Step tracking, completion indicators, time estimates
- **File Operations**: Success/failure reporting for file actions
- **Hook Output**: Structured reporting for utility results and workflow summaries

**Usage**: Ensures consistent output formatting across all system components.

### Performance Targets (`performance-targets.json`)

Sets performance benchmarks, quality thresholds, and resource usage limits for the system.

**Key Sections:**
- **Pipeline Performance**: Target times for each execution phase
- **Response Time**: Command execution and operation speed targets
- **Quality Targets**: Validation scores, consistency metrics, error rates
- **Resource Usage**: Memory, CPU, and storage limits
- **Reliability**: Uptime, error rates, recovery times
- **Scalability**: Concurrent usage and data volume limits
- **User Experience**: Command discovery, error messages, progress feedback

**Usage**: Provides measurable targets for system optimization and monitoring.

## System Manifest (`manifest.json`)

Located at `.system/manifest.json`, this file provides a comprehensive overview of the entire system architecture.

**Key Sections:**
- **System Metadata**: Version, description, creation/update dates
- **Structure Inventory**: Complete count and categorization of all system components
- **Capabilities**: Detailed feature descriptions and supported operations
- **Integration Points**: File paths and relationships between components
- **Quality Standards**: Validation thresholds and compliance requirements

**Usage**: Serves as the authoritative reference for system architecture and component relationships.

## Integration with System Components

### Runtime Usage
Configuration files are designed to be loaded at system startup and used throughout execution:

- **Orchestrator**: Loads AI context for operational awareness
- **Workflows**: Reference output standards for consistent formatting
- **Validation Engine**: Uses performance targets for quality thresholds
- **Utilities**: Apply formatting rules from output standards

### Development Usage
- **Documentation**: Manifest provides component inventory for developers
- **Testing**: Performance targets guide test case development
- **Deployment**: Configuration files can be environment-specific
- **Maintenance**: Output standards ensure consistent error reporting

## Modifying Configuration

### Safe Modifications
- **Output Standards**: Can be modified to change UI formatting
- **Performance Targets**: Adjust thresholds based on actual system performance
- **AI Context**: Update operational context for new environments

### Careful Modifications
- **System Manifest**: Should only be updated when adding/removing major components
- **Core AI Guidelines**: Changes affect fundamental system behavior

### File Structure
```
.system/
├── configs/
│   ├── ai-context.json
│   ├── output-standards.json
│   └── performance-targets.json
└── manifest.json
```

## Best Practices

1. **Version Control**: Keep configuration files under version control
2. **Environment-Specific**: Use different configs for development/production
3. **Documentation**: Update manifest when adding new components
4. **Validation**: Test configuration changes thoroughly
5. **Backup**: Maintain backups of working configurations

## Future Extensions

The configuration system is designed to support:
- Environment-specific overrides
- Dynamic configuration reloading
- Configuration validation schemas
- GUI configuration editors
- Configuration inheritance for multi-tenant deployments