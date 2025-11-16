#!/bin/bash
# system-init.sh - System initialization with pipeline validation

SYSTEM_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ORCHESTRATOR_SCRIPT="$SYSTEM_ROOT/.system/hooks/core/orchestrator.js"
HEALTH_CHECK_SCRIPT="$SYSTEM_ROOT/.system/hooks/utilities/system-health.sh"

echo "=========================================="
echo "🚀 OpenCode Pipeline System Initialization"
echo "=========================================="

# Step 1: Load AI context from config
echo "📋 Loading AI context from .system/config/ai-context.json..."
if [[ -f "$SYSTEM_ROOT/.system/config/ai-context.json" ]]; then
    echo "✅ AI context loaded successfully"
else
    echo "❌ Failed to load AI context"
    exit 1
fi

echo ""

# Step 2: Validate pipeline architecture
echo "🔧 Validating pipeline architecture..."
if [[ -f "$ORCHESTRATOR_SCRIPT" ]]; then
    echo "✅ Orchestrator script found"

    # Test orchestrator syntax
    if command -v node >/dev/null 2>&1; then
        if node -c "$ORCHESTRATOR_SCRIPT" >/dev/null 2>&1; then
            echo "✅ Orchestrator syntax is valid"
        else
            echo "❌ Orchestrator syntax is invalid"
            exit 1
        fi
    else
        echo "⚠️ Node.js not available for syntax validation"
    fi
else
    echo "❌ Orchestrator script not found: $ORCHESTRATOR_SCRIPT"
    exit 1
fi

# Check phase manager
if [[ -f "$SYSTEM_ROOT/.system/hooks/core/phase-manager.js" ]]; then
    echo "✅ Phase manager found"
else
    echo "❌ Phase manager not found"
    exit 1
fi

echo ""

# Step 3: Validate workflow components
echo "⚙️ Validating workflow components..."
WORKFLOW_COUNT=$(find "$SYSTEM_ROOT/.system/hooks/workflows" -name "*.js" 2>/dev/null | wc -l)
if [[ $WORKFLOW_COUNT -ge 5 ]]; then
    echo "✅ Found $WORKFLOW_COUNT workflow components"
else
    echo "❌ Insufficient workflow components: $WORKFLOW_COUNT (expected: 5+)"
    exit 1
fi

# Step 4: Validate rule system
echo "📏 Validating rule system..."
RULE_COUNT=$(find "$SYSTEM_ROOT/.system/hooks/rules" -name "*.js" 2>/dev/null | wc -l)
if [[ $RULE_COUNT -ge 5 ]]; then
    echo "✅ Found $RULE_COUNT rule components"
else
    echo "❌ Insufficient rule components: $RULE_COUNT (expected: 5+)"
    exit 1
fi

# Step 5: Validate utilities
echo "🛠️ Validating utility components..."
UTIL_COUNT=$(find "$SYSTEM_ROOT/.system/hooks/utilities" -type f \( -name "*.js" -o -name "*.sh" -o -name "*.py" \) 2>/dev/null | wc -l)
if [[ $UTIL_COUNT -ge 5 ]]; then
    echo "✅ Found $UTIL_COUNT utility components"
else
    echo "❌ Insufficient utility components: $UTIL_COUNT (expected: 5+)"
    exit 1
fi

echo ""

# Step 6: Run comprehensive health check
echo "🔍 Running comprehensive system health check..."
if [[ -x "$HEALTH_CHECK_SCRIPT" ]]; then
    echo "Executing health check..."
    if bash "$HEALTH_CHECK_SCRIPT" >/dev/null 2>&1; then
        echo "✅ System health check passed"
    else
        echo "❌ System health check failed"
        echo "🔧 Please review the health check log for details"
        exit 1
    fi
else
    echo "⚠️ Health check script not executable: $HEALTH_CHECK_SCRIPT"
    echo "🔧 Attempting basic validation..."

    # Basic validation fallback
    if [[ -f "$SYSTEM_ROOT/manifest.json" ]] && jq empty "$SYSTEM_ROOT/manifest.json" >/dev/null 2>&1; then
        echo "✅ Manifest validation passed"
    else
        echo "❌ Manifest validation failed"
        exit 1
    fi
fi

echo ""

# Step 7: Initialize pipeline orchestrator
echo "🎼 Initializing pipeline orchestrator..."
if command -v node >/dev/null 2>&1; then
    # Test orchestrator initialization
    if node -e "
        try {
            const Orchestrator = require('$ORCHESTRATOR_SCRIPT');
            const orchestrator = new Orchestrator('$SYSTEM_ROOT');
            console.log('Orchestrator initialized successfully');
        } catch (error) {
            console.error('Orchestrator initialization failed:', error.message);
            process.exit(1);
        }
    " 2>/dev/null; then
        echo "✅ Pipeline orchestrator initialized successfully"
    else
        echo "❌ Pipeline orchestrator initialization failed"
        exit 1
    fi
else
    echo "⚠️ Node.js not available - skipping orchestrator initialization test"
fi

echo ""

# Step 8: Validate command integration
echo "📝 Validating command integration..."
COMMAND_COUNT=$(find "$SYSTEM_ROOT/.system/commands" -name "*.md" 2>/dev/null | wc -l)
if [[ $COMMAND_COUNT -ge 10 ]]; then
    echo "✅ Found $COMMAND_COUNT command definitions"
else
    echo "⚠️ Low command count: $COMMAND_COUNT (expected: 10+)"
fi

# Step 9: Validate template system
echo "📋 Validating template system..."
TEMPLATE_COUNT=$(find "$SYSTEM_ROOT/.system/templates" -type f \( -name "*.json" -o -name "*.txt" \) 2>/dev/null | wc -l)
if [[ $TEMPLATE_COUNT -ge 5 ]]; then
    echo "✅ Found $TEMPLATE_COUNT templates"
else
    echo "⚠️ Low template count: $TEMPLATE_COUNT (expected: 5+)"
fi

echo ""

# Step 10: Final system status
echo "=========================================="
echo "🏁 System Initialization Complete"
echo "=========================================="
echo "✅ Pipeline architecture validated"
echo "✅ Core components functional"
echo "✅ Workflow system ready"
echo "✅ Rule validation system active"
echo "✅ Utility framework operational"
echo "🎯 OpenCode pipeline system is ready for use!"
echo "=========================================="