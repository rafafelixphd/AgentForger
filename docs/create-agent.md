# How to Create a New Agent

## Overview
Agents are specialized AI personas that provide consistent behavior and expertise. They use structured response frameworks.

## Step 1: Create Agent Definition

Create a markdown file with YAML frontmatter:

**Location:** `.system/agents/agent-name.md`

**Template:**
```markdown
---
name: agent-name
description: What this agent specializes in (1-2 sentences)
color: preferred-color
filename: agent-name.md
personality_traits:
  - Trait 1: Brief description
  - Trait 2: Brief description
core_values:
  - Value 1: Brief description
  - Value 2: Brief description
communication_guidelines:
  - Guideline 1
  - Guideline 2
response_framework:
  - Step 1 in response process
  - Step 2 in response process
specialized_playbooks:
  - Specialized approach 1
  - Specialized approach 2
---
```

## Step 2: Create Agent Guidelines

Create a JSON file defining response structure:

**Location:** `.system/templates/agents/agent-name.json`

**Template:**
```json
{
  "agent-name": {
    "response_structure": [
      {
        "type": "header",
        "template": "🎯 **AGENT HEADER**"
      },
      {
        "type": "analysis",
        "template": "**Analysis:** {message}"
      },
      {
        "type": "recommendation",
        "template": "**Recommendation:** {core_value_1}"
      }
    ],
    "guideline_mappings": {
      "personality_trait_1": "personality_traits.0",
      "core_value_1": "core_values.0"
    }
  }
}
```

## Step 3: Define Specialization

Focus your agent on specific expertise:
- **Domain:** What area does it specialize in?
- **Approach:** How does it solve problems?
- **Output:** What format does it provide results in?

## Step 4: Test Agent

Use the agent in commands that support agent selection:
```bash
/content:new --topic "example" --agent agent-name
```

## Files Created

**Required:**
- `.system/agents/agent-name.md` (definition)
- `.system/templates/agents/agent-name.json` (guidelines)

## Example: Creating a "Code Reviewer" Agent

1. **Create:** `.system/agents/code-reviewer.md`
    ```yaml
    ---
    name: code-reviewer
    description: Specialized in code quality assessment and improvement suggestions
    personality_traits:
      - Meticulous: Catches subtle bugs and edge cases
      - Constructive: Provides actionable improvement suggestions
    ---
    ```

2. **Create:** `.system/templates/agents/code-reviewer.json`
    ```json
    {
      "code-reviewer": {
        "response_structure": [
          {
            "type": "header",
            "template": "🔍 **CODE REVIEW**"
          }
        ]
      }
    }
    ```

## Best Practices

- **Specialization:** Focus on 1-2 specific areas of expertise
- **Guidelines:** Keep response structures simple and focused
- **Testing:** Test with various inputs to ensure consistent behavior
- **Naming:** Use descriptive, lowercase names with hyphens

## Agent Capabilities

Agents automatically get:
- Personality consistency
- Response formatting
- Quality validation
- Integration with all workflows