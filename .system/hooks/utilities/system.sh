#!/bin/bash
# system.sh - System utilities for pipeline operations
# Provides system monitoring, process management, and environment utilities

# Function to get system information
get_system_info() {
    cat << EOF
{
  "os": "$(uname -s)",
  "kernel": "$(uname -r)",
  "architecture": "$(uname -m)",
  "hostname": "$(hostname)",
  "uptime": "$(uptime | sed 's/.*up //' | sed 's/,.*//')",
  "load_average": "$(uptime | awk -F'load average:' '{ print $2 }' | sed 's/^ *//')",
  "cpu_count": "$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 'unknown')",
  "memory_total": "$(get_memory_total)",
  "memory_free": "$(get_memory_free)",
  "disk_usage": $(get_disk_usage)
}
EOF
}

# Function to get total memory
get_memory_total() {
    if command -v free >/dev/null 2>&1; then
        free -h | awk 'NR==2{print $2}'
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))GB"
    else
        echo "unknown"
    fi
}

# Function to get free memory
get_memory_free() {
    if command -v free >/dev/null 2>&1; then
        free -h | awk 'NR==2{print $4}'
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        vm_stat | awk '/free/ {print $3 * 4096 / 1024 / 1024 "MB"}' | head -1
    else
        echo "unknown"
    fi
}

# Function to get disk usage as JSON
get_disk_usage() {
    df -h 2>/dev/null | awk '
    NR>1 {
        printf "{\"mount\":\"%s\",\"total\":\"%s\",\"used\":\"%s\",\"available\":\"%s\",\"use_percent\":\"%s\"}", $6, $2, $3, $4, $5
        if(NR>2) printf ","
    }
    END { print "}" }
    ' | sed 's/}$/]/' | sed 's/{/[/'
}

# Function to check if command exists
command_exists() {
    local cmd="$1"
    command -v "$cmd" >/dev/null 2>&1
}

# Function to get process information
get_process_info() {
    local pid="${1:-$$}"

    if ! kill -0 "$pid" 2>/dev/null; then
        cat << EOF
{
  "error": "Process not found",
  "pid": $pid
}
EOF
        return 1
    fi

    local cmdline=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
    local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null | tr -d ' ' || echo "0.0")
    local memory=$(ps -p "$pid" -o %mem= 2>/dev/null | tr -d ' ' || echo "0.0")
    local status=$(ps -p "$pid" -o stat= 2>/dev/null || echo "unknown")
    local start_time=$(ps -p "$pid" -o lstart= 2>/dev/null || echo "unknown")

    cat << EOF
{
  "pid": $pid,
  "command": "$cmdline",
  "cpu_percent": "$cpu",
  "memory_percent": "$memory",
  "status": "$status",
  "start_time": "$start_time"
}
EOF
}

# Function to get environment variables
get_env_vars() {
    local filter="${1:-}"

    if [[ -n "$filter" ]]; then
        env | grep "$filter" | while IFS='=' read -r key value; do
            echo "{\"$key\":\"$value\"}"
        done | jq -s '.' 2>/dev/null || env | grep "$filter" | jq -R -s 'split("\n") | map(select(. != ""))'
    else
        env | while IFS='=' read -r key value; do
            echo "{\"$key\":\"$value\"}"
        done | jq -s '.' 2>/dev/null || env | jq -R -s 'split("\n") | map(select(. != ""))'
    fi
}

# Function to check network connectivity
check_network() {
    local host="${1:-8.8.8.8}"
    local timeout="${2:-5}"

    if ping -c 1 -W "$timeout" "$host" >/dev/null 2>&1; then
        echo "CONNECTED"
    else
        echo "DISCONNECTED"
    fi
}

# Function to get network interfaces
get_network_interfaces() {
    if command -v ip >/dev/null 2>&1; then
        ip addr show | awk '
        /^[0-9]+:/ { iface=$2; sub(":", "", iface) }
        /inet / { print "{\"interface\":\"" iface "\",\"ip\":\"" $2 "\"}" }
        ' | jq -s '.' 2>/dev/null || echo "[]"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        ifconfig | awk '
        /^[^	]/ { iface=$1 }
        /inet / { print "{\"interface\":\"" iface "\",\"ip\":\"" $2 "\"}" }
        ' | jq -s '.' 2>/dev/null || echo "[]"
    else
        echo "[]"
    fi
}

# Function to get current timestamp
get_timestamp() {
    local format="${1:-%Y-%m-%d %H:%M:%S}"
    date "$format"
}

# Function to measure execution time
time_execution() {
    local start_time=$(date +%s%N 2>/dev/null || date +%s)
    "$@"
    local end_time=$(date +%s%N 2>/dev/null || date +%s)

    # Calculate duration in milliseconds
    if command -v bc >/dev/null 2>&1; then
        local duration_ns=$((end_time - start_time))
        if [[ "${#start_time}" -gt 10 ]]; then
            # Nanosecond precision
            echo "scale=2; $duration_ns / 1000000" | bc
        else
            # Second precision
            echo "$(( (end_time - start_time) * 1000 ))"
        fi
    else
        echo "$(( (end_time - start_time) * 1000 ))"
    fi
}

# Function to log message with timestamp
log_message() {
    local level="${1:-INFO}"
    local message="$2"
    local timestamp=$(get_timestamp)

    echo "[$timestamp] [$level] $message" >&2
}

# Function to check system requirements
check_requirements() {
    local requirements_file="$1"

    if [[ ! -f "$requirements_file" ]]; then
        cat << EOF
{
  "error": "Requirements file not found",
  "file": "$requirements_file"
}
EOF
        return 1
    fi

    local missing=()
    local available=()

    while IFS= read -r requirement; do
        # Skip comments and empty lines
        [[ "$requirement" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$requirement" ]] && continue

        if command_exists "$requirement"; then
            available+=("$requirement")
        else
            missing+=("$requirement")
        fi
    done < "$requirements_file"

    cat << EOF
{
  "total_requirements": $((${#available[@]} + ${#missing[@]})),
  "available": [$(printf '"%s",' "${available[@]}" | sed 's/,$//')],
  "missing": [$(printf '"%s",' "${missing[@]}" | sed 's/,$//')],
  "satisfied": $([[ ${#missing[@]} -eq 0 ]] && echo "true" || echo "false")
}
EOF
}

# Function to get system load
get_system_load() {
    local load=$(uptime | awk -F'load average:' '{ print $2 }' | sed 's/^ *//' | cut -d',' -f1)
    local cores=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo "1")

    # Calculate load percentage
    if command -v bc >/dev/null 2>&1 && [[ "$cores" != "unknown" ]]; then
        local load_percent=$(echo "scale=2; ($load / $cores) * 100" | bc)
        cat << EOF
{
  "load_average": "$load",
  "cpu_cores": $cores,
  "load_percent": "$load_percent%"
}
EOF
    else
        cat << EOF
{
  "load_average": "$load",
  "cpu_cores": "$cores",
  "load_percent": "unknown"
}
EOF
    fi
}

# Function to monitor process
monitor_process() {
    local pid="$1"
    local duration="${2:-10}"
    local interval="${3:-1}"

    if ! kill -0 "$pid" 2>/dev/null; then
        echo "Process $pid not found"
        return 1
    fi

    local count=0
    local max_count=$((duration / interval))

    echo "Monitoring process $pid for ${duration}s (interval: ${interval}s)"
    echo "Time,CPU%,Memory%,Status"

    while [[ $count -lt $max_count ]] && kill -0 "$pid" 2>/dev/null; do
        local info=$(get_process_info "$pid")
        local cpu=$(echo "$info" | jq -r '.cpu_percent' 2>/dev/null || echo "0.0")
        local memory=$(echo "$info" | jq -r '.memory_percent' 2>/dev/null || echo "0.0")
        local status=$(echo "$info" | jq -r '.status' 2>/dev/null || echo "unknown")

        echo "$(get_timestamp),$cpu,$memory,$status"
        sleep "$interval"
        ((count++))
    done
}

# Main execution logic
case "$1" in
    info)
        get_system_info
        ;;
    memory-total)
        get_memory_total
        ;;
    memory-free)
        get_memory_free
        ;;
    disk-usage)
        get_disk_usage
        ;;
    command-exists)
        command_exists "$2" && echo "true" || echo "false"
        ;;
    process-info)
        get_process_info "$2"
        ;;
    env-vars)
        get_env_vars "$2"
        ;;
    network-check)
        check_network "$2" "$3"
        ;;
    network-interfaces)
        get_network_interfaces
        ;;
    timestamp)
        get_timestamp "$2"
        ;;
    time-execution)
        shift
        time_execution "$@"
        ;;
    log)
        log_message "$2" "$3"
        ;;
    check-requirements)
        check_requirements "$2"
        ;;
    system-load)
        get_system_load
        ;;
    monitor-process)
        monitor_process "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: $0 <command> [args...]"
        echo ""
        echo "Commands:"
        echo "  info                      - Get system information"
        echo "  memory-total              - Get total memory"
        echo "  memory-free               - Get free memory"
        echo "  disk-usage                - Get disk usage information"
        echo "  command-exists <cmd>      - Check if command exists"
        echo "  process-info [pid]        - Get process information"
        echo "  env-vars [filter]         - Get environment variables"
        echo "  network-check [host] [timeout] - Check network connectivity"
        echo "  network-interfaces        - Get network interfaces"
        echo "  timestamp [format]        - Get current timestamp"
        echo "  time-execution <command>  - Time command execution"
        echo "  log <level> <message>     - Log message with timestamp"
        echo "  check-requirements <file> - Check system requirements"
        echo "  system-load               - Get system load information"
        echo "  monitor-process <pid> [duration] [interval] - Monitor process"
        echo ""
        echo "Examples:"
        echo "  $0 info"
        echo "  $0 process-info 1234"
        echo "  $0 time-execution sleep 2"
        echo "  $0 monitor-process \$\$ 5 1"
        exit 1
        ;;
esac