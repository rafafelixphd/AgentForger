# Agent Forger 🤖

*A meta-system for forging AI agents with structured workflows*

<p align="center">
  <img src="./docs/src/loid-forger.webp" alt="Agent Forger Logo" width="200"/>
</p>

## What is Agent Forger?

Agent Forger is a meta-system that enables you to create, customize, and orchestrate AI agents through structured workflows. Just as Loid Forger creates identities and missions in Spy x Family, Agent Forger helps you "forge" AI agents with specific capabilities, personalities, and collaboration patterns.

The system provides a framework for building AI-powered applications where multiple agents work together through a modular pipeline architecture, ensuring quality, consistency, and extensibility.

## Core Concept: Meta-System

Agent Forger is a **meta-system** - a system that creates and manages other systems. It provides:

- **Agent Templates**: Pre-built AI personalities with specific expertise
- **Workflow Pipelines**: Structured 5-phase processing for consistent results
- **Command Patterns**: `/category:action` interface for easy interaction
- **Quality Assurance**: Built-in validation and improvement cycles
- **Extensibility**: Easy creation of new agents, commands, and workflows
- **Adaptability**: Works seamlessly with main AI coding agents (Claude, GPT, etc.) and command-line interfaces

## Example: Message Commands

The message system demonstrates how Agent Forger works as a meta-system. Let's examine the `/message:new` and `/message:read` commands:

### `/message:new` - Creating Conversations

```bash
/message:new --message "Hello, can you help me plan a project?" --to "discussion-moderator"
```

**What happens internally:**
1. **Command Parsing**: Extracts message content and target agent
2. **Agent Routing**: Routes to the specified agent (discussion-moderator)
3. **Processing**: Agent processes the message using its personality and guidelines
4. **Response Generation**: Creates a structured response
5. **Persistence**: Saves conversation to `workspace/conversation/_inbox.md`

**File Structure:**
```
workspace/conversation/
├── _inbox.md          # Active conversations
├── 2025-11-16.md      # Daily conversation archives
└── 2025-11-17.md      # Previous days
```

*Note: The current implementation simulates message storage. In a full deployment, messages would be persisted to these files.*

**Example saved conversation:**

---
@$user 🟢 _2025-11-16_:
```markdown
Hello, can you help me plan a project?
```
---

---
@$discussion-moderator 🔵 _2025-11-16_
```markdown
🤖 **DISCUSSION-MODERATOR RESPONSE**
**Analysis:** This is a project planning request...
**Moderation:** Focus on productive dialogue...
**Action:** I'll help you break this down systematically...
```

### `/message:read` - Reading Conversations

```bash
/message:read --count 3
```

**What happens:**
1. **File Access**: Reads from `workspace/conversation/_inbox.md`
2. **Parsing**: Extracts recent messages
3. **Formatting**: Returns structured conversation history
4. **Display**: Shows chronological message thread

## Using the Meta-System

Agent Forger enables you to create custom AI workflows by leveraging its own AI agents to understand and extend the system. Here's how:

### Step 1: Read the Guidelines

First, have your AI agent thoroughly study the meta-system architecture:

```bash
Please read and deeply understand all the files in ./docs/ directory. This is the Agent Forger meta-system that provides the framework for creating AI agents, workflows, commands, rules, and templates.

Key areas to understand:
- The /category:action command pattern
- Agent inheritance and personality frameworks
- 5-phase pipeline workflow execution
- Template structures for content generation
- Rule validation systems
- Utility functions and integrations

After understanding the complete architecture, explain how you would apply these patterns to create a new [specific domain] command/workflow/agent that follows Agent Forger best practices.
```

### Step 2: Create Custom Commands

Use Agent Forger's AI to design and implement new capabilities:

#### Japanese Learning Suite
```bash
Please read and understand all the files in ./docs/ carefully. They are the meta-system we will use for our AI agents. Now, understanding the structure, please create a command for Japanese learning that includes:

- A tutor for N5 level vocabulary and grammar
- A translator for English-Japanese conversion
- A tester for JLPT practice questions
- Progress tracking and spaced repetition

Follow the Agent Forger patterns for commands, workflows, rules, and templates.
```

**Example commands you might want:**
- `/japanese:practice --level n5 --topic vocabulary`
- `/japanese:translate --text "hello" --to japanese`
- `/japanese:test --type jlpt --level n5`
- `/japanese:progress --user john`

#### Frontend Development Assistant
```bash
Please read and understand all the files in ./docs/ carefully. They are the meta-system we will use for our AI agents. Now, understanding the structure, please create a command for frontend development that includes:

- Component generation with TypeScript
- Styling with modern CSS frameworks
- Testing setup and execution
- Performance optimization reviews

Follow the Agent Forger patterns for commands, workflows, rules, and templates.
```

**Example commands you might want:**
- `/frontend:component --name Button --framework react --typescript`
- `/frontend:style --component Button --framework tailwind`
- `/frontend:test --component Button --type unit`
- `/frontend:optimize --page dashboard --metric performance`

#### Research Paper Assistant
```bash
Please read and understand all the files in ./docs/ carefully. They are the meta-system we will use for our AI agents. Now, understanding the structure, please create a command for research paper writing that includes:

- Literature review and source finding
- Outline generation and structuring
- Citation management and formatting
- Plagiarism checking and style validation

Follow the Agent Forger patterns for commands, workflows, rules, and templates.
```

**Example commands you might want:**
- `/research:find --topic "machine learning" --sources 10`
- `/research:outline --topic "AI ethics" --sections 5`
- `/research:cite --style apa --sources "source1,source2"`
- `/research:check --paper draft.md --type plagiarism`

#### Social Media Content Creator
```bash
Please read and understand all the files in ./docs/ carefully. They are the meta-system we will use for our AI agents. Now, understanding the structure, please create a command for social media content that includes:

- Platform-optimized post creation
- Hashtag research and optimization
- Engagement prediction and timing
- Content performance analysis

Follow the Agent Forger patterns for commands, workflows, rules, and templates.
```

**Example commands you might want:**
- `/social:create --platform linkedin --topic "AI trends" --tone professional`
- `/social:hashtags --topic "machine learning" --count 5`
- `/social:schedule --post draft.md --platform twitter --time "9:00"`
- `/social:analyze --post post.md --metric engagement`

### Step 3: Quality Assurance

Always validate your creations:

```bash
Please review the command/workflow/agent I just created and ensure it follows Agent Forger best practices. Check for:

- Proper command structure (/category:action)
- Complete workflow implementation
- Appropriate validation rules
- Consistent template usage
- Quality agent guidelines
```

### Step 4: Integration

Add your new components to the system:

```bash
Please integrate the new [command/workflow/agent] into the existing Agent Forger structure, updating all necessary files and ensuring proper registration.
```

## Meta-System Benefits

### For Developers
- **Rapid Prototyping**: Create specialized AI tools quickly
- **Consistent Architecture**: All extensions follow proven patterns
- **Quality Assurance**: Built-in validation and improvement cycles
- **Scalability**: Easy to add new agents and capabilities

### For AI Agents
- **Structured Collaboration**: Multiple agents work together effectively
- **Quality Standards**: Consistent output quality across all tasks
- **Specialization**: Each agent can focus on specific expertise areas
- **Extensibility**: New capabilities can be added without breaking existing functionality

## Getting Started

1. **Clone the repository**
2. **Initialize the system**: `/system:on`
3. **Read the documentation**: Study `./docs/` thoroughly
4. **Start creating**: Use the meta-system to build your own AI workflows
5. **Iterate and improve**: Use Agent Forger's own AI to refine your creations

## Examples of What You Can Build

- **Educational Tools**: Language learning, skill development, tutoring systems
- **Development Assistants**: Code generation, review, testing, deployment
- **Content Creation**: Writing, design, multimedia production
- **Research Tools**: Data analysis, literature review, hypothesis testing
- **Business Applications**: Customer service, data processing, automation
- **Creative Workflows**: Art generation, music composition, storytelling

## Philosophy

Agent Forger embodies the concept of "forging" AI systems - carefully crafting agents with specific purposes, personalities, and capabilities, then orchestrating them to work together seamlessly. Like a master forger creating the perfect tool for each job, Agent Forger helps you build AI systems that are reliable, effective, and perfectly suited to their tasks.

---

*Forge AI agents with structured workflows - Agent Forger*