#!/bin/bash
# system-health.sh - Comprehensive system health checks for pipeline architecture

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SYSTEM_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
LOGS_DIR="$SYSTEM_ROOT/logs"
LOG_FILE="$LOGS_DIR/health-check-$(date +%Y%m%d-%H%M%S).log"

# Initialize counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_FILE"
}

# Status functions
pass() {
    echo -e "${GREEN}✓ PASS${NC} - $1"
    ((CHECKS_PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC} - $1"
    ((CHECKS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC} - $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ INFO${NC} - $1"
}

# Check pipeline architecture integrity
check_pipeline_architecture() {
    info "Checking pipeline architecture..."

    # Check core pipeline components
    local core_components=(
        ".system/hooks/core/orchestrator.js"
        ".system/hooks/core/phase-manager.js"
    )

    for component in "${core_components[@]}"; do
        if [[ ! -f "$SYSTEM_ROOT/$component" ]]; then
            fail "Missing core pipeline component: $component"
        else
            pass "Core pipeline component present: $component"
        fi
    done

    # Check workflow components
    local workflow_count=$(find "$SYSTEM_ROOT/.system/hooks/workflows" -name "*.js" 2>/dev/null | wc -l)
    if [[ $workflow_count -ge 5 ]]; then
        pass "Workflow components present: $workflow_count workflows"
    else
        fail "Insufficient workflow components: $workflow_count (expected: 5+)"
    fi

    # Check rule components
    local rule_count=$(find "$SYSTEM_ROOT/.system/hooks/rules" -name "*.js" 2>/dev/null | wc -l)
    if [[ $rule_count -ge 5 ]]; then
        pass "Rule components present: $rule_count rules"
    else
        fail "Insufficient rule components: $rule_count (expected: 5+)"
    fi

    # Check utility components
    local util_count=$(find "$SYSTEM_ROOT/.system/hooks/utilities" -name "*.js" -o -name "*.sh" -o -name "*.py" 2>/dev/null | wc -l)
    if [[ $util_count -ge 5 ]]; then
        pass "Utility components present: $util_count utilities"
    else
        fail "Insufficient utility components: $util_count (expected: 5+)"
    fi
}

# Check orchestrator functionality
check_orchestrator_functionality() {
    info "Checking orchestrator functionality..."

    local orchestrator_script="$SYSTEM_ROOT/.system/hooks/core/orchestrator.js"

    if [[ ! -f "$orchestrator_script" ]]; then
        fail "Orchestrator script not found"
        return 1
    fi

    # Test basic Node.js syntax
    if command -v node >/dev/null 2>&1; then
        if node -c "$orchestrator_script" >/dev/null 2>&1; then
            pass "Orchestrator syntax is valid"
        else
            fail "Orchestrator syntax is invalid"
        fi
    else
        warn "Node.js not available for syntax checking"
    fi

    # Check if orchestrator can load required modules
    if node -e "
        try {
            const path = require('path');
            const Orchestrator = require('$orchestrator_script');
            console.log('Orchestrator module loads successfully');
        } catch (error) {
            console.error('Orchestrator module failed to load:', error.message);
            process.exit(1);
        }
    " 2>/dev/null; then
        pass "Orchestrator module loads correctly"
    else
        fail "Orchestrator module failed to load"
    fi
}

# Check pipeline phase execution
check_pipeline_phases() {
    info "Checking pipeline phase execution..."

    local phase_manager="$SYSTEM_ROOT/.system/hooks/core/phase-manager.js"

    if [[ ! -f "$phase_manager" ]]; then
        fail "Phase manager not found"
        return 1
    fi

    # Check if phase manager defines required phases
    local required_phases=("initialization" "parameters" "workflow" "validation" "output")
    local missing_phases=()

    for phase in "${required_phases[@]}"; do
        if ! grep -q "$phase" "$phase_manager" 2>/dev/null; then
            missing_phases+=("$phase")
        fi
    done

    if [[ ${#missing_phases[@]} -eq 0 ]]; then
        pass "Phase manager defines all required pipeline phases"
    else
        fail "Phase manager missing required pipeline phases: ${missing_phases[*]}"
    fi

    # Check phase execution methods
    local required_methods=("executePhase" "executePipeline" "isCriticalPhase")
    for method in "${required_methods[@]}"; do
        if grep -q "async $method\|$method(" "$phase_manager" 2>/dev/null; then
            pass "Phase manager has $method method"
        else
            fail "Phase manager missing $method method"
        fi
    done
}

# Check workflow integration
check_workflow_integration() {
    info "Checking workflow integration..."

    # Check each workflow for proper inheritance
    local workflows=(
        "content.js"
        "research.js"
        "message.js"
        "project.js"
        "system.js"
    )

    for workflow in "${workflows[@]}"; do
        local workflow_file="$SYSTEM_ROOT/.system/hooks/workflows/$workflow"
        if [[ ! -f "$workflow_file" ]]; then
            fail "Missing workflow: $workflow"
            continue
        fi

        # Check for BaseWorkflow inheritance
        if grep -q "BaseWorkflow\|require.*base" "$workflow_file" 2>/dev/null; then
            pass "Workflow $workflow properly inherits from BaseWorkflow"
        else
            fail "Workflow $workflow missing BaseWorkflow inheritance"
        fi

        # Check for phase methods
        local phase_methods=("executeInitializationPhase" "executeParametersPhase" "executeWorkflowPhase" "executeValidationPhase" "executeOutputPhase")
        local implemented_phases=0
        for method in "${phase_methods[@]}"; do
            if grep -q "$method" "$workflow_file" 2>/dev/null; then
                ((implemented_phases++))
            fi
        done

        if [[ $implemented_phases -ge 3 ]]; then
            pass "Workflow $workflow implements $implemented_phases phase methods"
        else
            warn "Workflow $workflow implements only $implemented_phases phase methods (recommended: 3+)"
        fi
    done
}

# Check rule validation system
check_rule_validation() {
    info "Checking rule validation system..."

    local rules_dir="$SYSTEM_ROOT/.system/hooks/rules"
    local rule_files=()

    # Get all rule files
    while IFS= read -r -d '' rule_file; do
        rule_files+=("$rule_file")
    done < <(find "$rules_dir" -name "*.js" -print0 2>/dev/null)

    if [[ ${#rule_files[@]} -eq 0 ]]; then
        fail "No rule files found"
        return 1
    fi

    # Check each rule file
    for rule_file in "${rule_files[@]}"; do
        local rule_name=$(basename "$rule_file" .js)

        # Check for BaseRule inheritance (which provides validate method)
        if grep -q "BaseRule\|require.*base" "$rule_file" 2>/dev/null; then
            pass "Rule $rule_name properly inherits from BaseRule"
        else
            fail "Rule $rule_name missing BaseRule inheritance"
        fi
    done

    info "Found ${#rule_files[@]} rule files total"
}

# Check utility integration
check_utility_integration() {
    info "Checking utility integration..."

    local util_dir="$SYSTEM_ROOT/.system/hooks/utilities"
    local util_files=()

    # Get all utility files
    while IFS= read -r -d '' util_file; do
        util_files+=("$util_file")
    done < <(find "$util_dir" -type f \( -name "*.js" -o -name "*.sh" -o -name "*.py" \) -print0 2>/dev/null)

    if [[ ${#util_files[@]} -eq 0 ]]; then
        fail "No utility files found"
        return 1
    fi

    # Check utility executability
    for util_file in "${util_files[@]}"; do
        local util_name=$(basename "$util_file")

        if [[ -x "$util_file" ]]; then
            pass "Utility $util_name is executable"
        else
            warn "Utility $util_name is not executable"
        fi
    done

    # Check for required utilities
    local required_utils=("text/counter.sh" "formatter.js" "validator.py" "file-ops.sh" "system.sh")
    for required_util in "${required_utils[@]}"; do
        if [[ -f "$util_dir/$required_util" ]]; then
            pass "Required utility present: $required_util"
        else
            fail "Missing required utility: $required_util"
        fi
    done

    info "Found ${#util_files[@]} utility files total"
}

# Check if file exists and is readable
check_file_access() {
    local file="$1"
    if [[ ! -f "$file" ]]; then
        fail "File does not exist: $file"
        return 1
    fi

    if [[ ! -r "$file" ]]; then
        fail "File is not readable: $file"
        return 1
    fi

    pass "File accessible: $file"
    return 0
}

# Check directory structure
check_directory_structure() {
    info "Checking directory structure..."

    local required_dirs=(
        ".system/hooks/core"
        ".system/hooks/workflows"
        ".system/hooks/rules"
        ".system/hooks/utilities"
        ".system/commands"
        ".system/agents"
        ".system/templates"
        ".system/config"
    )

    for dir in "${required_dirs[@]}"; do
        if [[ -d "$SYSTEM_ROOT/$dir" ]]; then
            pass "Required directory exists: $dir"
        else
            fail "Missing required directory: $dir"
        fi
    done
}

# Check for orphaned/unused files
check_unused_files() {
    info "Checking for unused/orphaned files..."

    # Get all files in the system (excluding system files)
    local all_files=()
    while IFS= read -r -d '' file; do
        # Skip system files and directories
        local rel_path="${file#$SYSTEM_ROOT/}"
        if [[ "$rel_path" =~ ^\. ]] || [[ "$rel_path" =~ __pycache__ ]] || [[ "$rel_path" =~ node_modules ]] || \
           [[ "$rel_path" =~ \.(git|DS_Store) ]] || [[ "$rel_path" == "manifest.json" ]] || \
           [[ "$rel_path" == *.log ]] || [[ "$rel_path" =~ ^health-check- ]]; then
            continue
        fi
        all_files+=("$rel_path")
    done < <(find "$SYSTEM_ROOT" -type f -print0)

    # Check each file for references in the pipeline system
    local orphaned_files=()
    for file in "${all_files[@]}"; do
        # Search for references to this file in pipeline components
        local filename=$(basename "$file")
        local references_found=false

        # Search in hooks, commands, and manifest
        if grep -r --exclude="$filename" "$filename" "$SYSTEM_ROOT/.system/hooks/" "$SYSTEM_ROOT/.system/commands/" "$SYSTEM_ROOT/manifest.json" >/dev/null 2>&1; then
            references_found=true
        fi

        # Special check for template files
        if [[ "$file" =~ ^templates/ ]]; then
            if grep -r "templates/" "$SYSTEM_ROOT/.system/commands/" | grep -q "$filename"; then
                references_found=true
            fi
        fi

        # Special check for rule files
        if [[ "$file" =~ ^rules/ ]]; then
            if grep -r "rules/" "$SYSTEM_ROOT/.system/hooks/" | grep -q "$filename"; then
                references_found=true
            fi
        fi

        if [[ "$references_found" == false ]]; then
            orphaned_files+=("$file")
        fi
    done

    if [[ ${#orphaned_files[@]} -gt 0 ]]; then
        warn "Found ${#orphaned_files[@]} potentially unused files:"
        for file in "${orphaned_files[@]}"; do
            echo "  - $file"
        done
    else
        pass "No orphaned files detected"
    fi
}

# Check config file integrity
check_config_integrity() {
    info "Checking config file integrity..."

    # Dynamically discover all JSON files in config directory
    local config_files=()
    while IFS= read -r -d '' config_file; do
        local rel_path="${config_file#$SYSTEM_ROOT/}"
        config_files+=("$rel_path")
    done < <(find "$SYSTEM_ROOT/.system/config" -type f -name "*.json" -print0)

    # Check each config file
    for config_file in "${config_files[@]}"; do
        if [[ ! -f "$SYSTEM_ROOT/$config_file" ]]; then
            fail "Missing config file: $config_file"
        else
            # Check if it's valid JSON
            if ! jq empty "$SYSTEM_ROOT/$config_file" 2>/dev/null; then
                fail "Invalid JSON in config file: $config_file"
            else
                pass "Config file valid: $config_file"
            fi
        fi
    done

    info "Found ${#config_files[@]} config files total"
}

# Main execution
main() {
    echo "=========================================="
    echo "🔍 .system Pipeline Health Check"
    echo "=========================================="
    log "Starting pipeline health check"

    check_directory_structure
    echo

    check_pipeline_architecture
    echo

    check_orchestrator_functionality
    echo

    check_pipeline_phases
    echo

    check_workflow_integration
    echo

    check_rule_validation
    echo

    check_utility_integration
    echo

    check_unused_files
    echo

    check_config_integrity
    echo

    # Summary
    echo "=========================================="
    echo "📊 Pipeline Health Check Summary"
    echo "=========================================="
    echo "✅ Passed: $CHECKS_PASSED"
    echo "❌ Failed: $CHECKS_FAILED"
    echo "⚠️  Warnings: $WARNINGS"
    echo
    echo "📝 Detailed log: $LOG_FILE"
    echo "📁 All logs: $LOGS_DIR/"

    if [[ $CHECKS_FAILED -gt 0 ]]; then
        echo -e "${RED}❌ Pipeline health check completed with failures${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Pipeline health check passed${NC}"
        exit 0
    fi
}

# Run main function
main "$@"