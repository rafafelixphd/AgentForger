#!/bin/bash
# file-ops.sh - File operations utilities
# Provides comprehensive file and directory operations for pipeline workflows

# Function to check if file exists and is readable
file_exists() {
    local file_path="$1"
    [[ -f "$file_path" && -r "$file_path" ]]
}

# Function to check if directory exists and is accessible
dir_exists() {
    local dir_path="$1"
    [[ -d "$dir_path" && -r "$dir_path" ]]
}

# Function to get file size in bytes
get_file_size() {
    local file_path="$1"
    if file_exists "$file_path"; then
        stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to get file modification time
get_file_mtime() {
    local file_path="$1"
    if file_exists "$file_path"; then
        stat -f%Sm -t "%Y-%m-%d %H:%M:%S" "$file_path" 2>/dev/null || stat -c"%y" "$file_path" 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# Function to get file extension
get_file_extension() {
    local file_path="$1"
    echo "${file_path##*.}"
}

# Function to get filename without extension
get_filename_no_ext() {
    local file_path="$1"
    local filename=$(basename "$file_path")
    echo "${filename%.*}"
}

# Function to create directory if it doesn't exist
ensure_dir() {
    local dir_path="$1"
    if [[ ! -d "$dir_path" ]]; then
        mkdir -p "$dir_path"
        echo "Created directory: $dir_path"
    fi
}

# Function to safely copy file with backup
safe_copy() {
    local source="$1"
    local dest="$2"
    local backup="${dest}.backup"

    if [[ -f "$dest" ]]; then
        cp "$dest" "$backup" || return 1
    fi

    cp "$source" "$dest" || return 1

    # Remove backup if copy succeeded
    [[ -f "$backup" ]] && rm "$backup"
    return 0
}

# Function to safely move file
safe_move() {
    local source="$1"
    local dest="$2"

    if [[ -f "$dest" ]]; then
        echo "Destination file exists: $dest"
        return 1
    fi

    mv "$source" "$dest"
}

# Function to create temporary file
create_temp_file() {
    local prefix="${1:-tmp}"
    local suffix="${2:-}"

    if command -v mktemp >/dev/null 2>&1; then
        mktemp "${TMPDIR:-/tmp}/${prefix}XXXXXX${suffix}"
    else
        # Fallback for systems without mktemp
        local temp_file="${TMPDIR:-/tmp}/${prefix}$RANDOM${suffix}"
        touch "$temp_file"
        echo "$temp_file"
    fi
}

# Function to clean up temporary files
cleanup_temp_files() {
    local pattern="$1"
    local temp_dir="${TMPDIR:-/tmp}"

    find "$temp_dir" -name "$pattern" -type f -mtime +1 -delete 2>/dev/null || true
}

# Function to read file content safely
read_file_content() {
    local file_path="$1"
    local max_lines="${2:-1000}"

    if ! file_exists "$file_path"; then
        echo "Error: File does not exist or is not readable: $file_path" >&2
        return 1
    fi

    head -n "$max_lines" "$file_path"
}

# Function to write content to file safely
write_file_content() {
    local file_path="$1"
    local content="$2"
    local mode="${3:-0644}"

    # Ensure directory exists
    ensure_dir "$(dirname "$file_path")"

    # Write content
    echo -n "$content" > "$file_path" || return 1

    # Set permissions
    chmod "$mode" "$file_path" || return 1

    echo "File written successfully: $file_path"
}

# Function to append content to file
append_file_content() {
    local file_path="$1"
    local content="$2"

    # Ensure directory exists
    ensure_dir "$(dirname "$file_path")"

    echo -n "$content" >> "$file_path"
}

# Function to find files by pattern
find_files() {
    local search_path="$1"
    local pattern="$2"
    local max_depth="${3:-3}"

    if [[ ! -d "$search_path" ]]; then
        echo "Error: Search path does not exist: $search_path" >&2
        return 1
    fi

    find "$search_path" -maxdepth "$max_depth" -name "$pattern" -type f 2>/dev/null
}

# Function to get directory size
get_dir_size() {
    local dir_path="$1"

    if ! dir_exists "$dir_path"; then
        echo "0"
        return 1
    fi

    du -sb "$dir_path" 2>/dev/null | cut -f1 || echo "0"
}

# Function to list directory contents
list_dir() {
    local dir_path="$1"
    local show_hidden="${2:-false}"

    if ! dir_exists "$dir_path"; then
        echo "Error: Directory does not exist: $dir_path" >&2
        return 1
    fi

    if [[ "$show_hidden" == "true" ]]; then
        ls -la "$dir_path"
    else
        ls -l "$dir_path"
    fi
}

# Function to check file permissions
check_permissions() {
    local file_path="$1"
    local permission="$2"  # r, w, x

    if [[ ! -e "$file_path" ]]; then
        echo "false"
        return 1
    fi

    case "$permission" in
        r) [[ -r "$file_path" ]] && echo "true" || echo "false" ;;
        w) [[ -w "$file_path" ]] && echo "true" || echo "false" ;;
        x) [[ -x "$file_path" ]] && echo "true" || echo "false" ;;
        *) echo "false" ;;
    esac
}

# Function to get file info as JSON
get_file_info() {
    local file_path="$1"

    if ! file_exists "$file_path"; then
        cat << EOF
{
  "error": "File does not exist or is not readable",
  "path": "$file_path"
}
EOF
        return 1
    fi

    local size=$(get_file_size "$file_path")
    local mtime=$(get_file_mtime "$file_path")
    local extension=$(get_file_extension "$file_path")
    local filename_no_ext=$(get_filename_no_ext "$file_path")
    local readable=$(check_permissions "$file_path" "r")
    local writable=$(check_permissions "$file_path" "w")
    local executable=$(check_permissions "$file_path" "x")

    cat << EOF
{
  "path": "$file_path",
  "exists": true,
  "size": $size,
  "modified": "$mtime",
  "extension": "$extension",
  "filename_no_ext": "$filename_no_ext",
  "permissions": {
    "readable": $readable,
    "writable": $writable,
    "executable": $executable
  }
}
EOF
}

# Function to validate file path
validate_file_path() {
    local file_path="$1"
    local must_exist="${2:-false}"

    # Check for dangerous characters
    if [[ "$file_path" =~ [\`\$\|\&\;\(\)\<\>\"\'\ ] ]]; then
        echo "INVALID: Dangerous characters in path"
        return 1
    fi

    # Check if path is absolute (recommended for security)
    if [[ "$file_path" != /* ]]; then
        echo "INVALID: Path must be absolute"
        return 1
    fi

    # Check if file should exist
    if [[ "$must_exist" == "true" && ! -e "$file_path" ]]; then
        echo "INVALID: File does not exist"
        return 1
    fi

    echo "VALID"
    return 0
}

# Main execution logic
case "$1" in
    exists)
        file_exists "$2" && echo "true" || echo "false"
        ;;
    dir-exists)
        dir_exists "$2" && echo "true" || echo "false"
        ;;
    size)
        get_file_size "$2"
        ;;
    mtime)
        get_file_mtime "$2"
        ;;
    extension)
        get_file_extension "$2"
        ;;
    filename-no-ext)
        get_filename_no_ext "$2"
        ;;
    ensure-dir)
        ensure_dir "$2"
        ;;
    safe-copy)
        safe_copy "$2" "$3" && echo "Copy successful" || echo "Copy failed"
        ;;
    safe-move)
        safe_move "$2" "$3" && echo "Move successful" || echo "Move failed"
        ;;
    temp-file)
        create_temp_file "$2" "$3"
        ;;
    cleanup-temp)
        cleanup_temp_files "$2"
        ;;
    read-file)
        read_file_content "$2" "$3"
        ;;
    write-file)
        write_file_content "$2" "$3" "$4"
        ;;
    append-file)
        append_file_content "$2" "$3"
        ;;
    find-files)
        find_files "$2" "$3" "$4"
        ;;
    dir-size)
        get_dir_size "$2"
        ;;
    list-dir)
        list_dir "$2" "$3"
        ;;
    check-perm)
        check_permissions "$2" "$3"
        ;;
    info)
        get_file_info "$2"
        ;;
    validate-path)
        validate_file_path "$2" "$3"
        ;;
    *)
        echo "Usage: $0 <command> [args...]"
        echo ""
        echo "Commands:"
        echo "  exists <file>              - Check if file exists"
        echo "  dir-exists <dir>           - Check if directory exists"
        echo "  size <file>                - Get file size in bytes"
        echo "  mtime <file>               - Get file modification time"
        echo "  extension <file>           - Get file extension"
        echo "  filename-no-ext <file>     - Get filename without extension"
        echo "  ensure-dir <dir>           - Create directory if it doesn't exist"
        echo "  safe-copy <src> <dest>     - Safely copy file with backup"
        echo "  safe-move <src> <dest>     - Safely move file"
        echo "  temp-file [prefix] [suffix] - Create temporary file"
        echo "  cleanup-temp <pattern>     - Clean up old temp files"
        echo "  read-file <file> [max_lines] - Read file content safely"
        echo "  write-file <file> <content> [mode] - Write content to file"
        echo "  append-file <file> <content> - Append content to file"
        echo "  find-files <path> <pattern> [max_depth] - Find files by pattern"
        echo "  dir-size <dir>             - Get directory size"
        echo "  list-dir <dir> [show_hidden] - List directory contents"
        echo "  check-perm <file> <r|w|x>  - Check file permissions"
        echo "  info <file>                - Get file info as JSON"
        echo "  validate-path <path> [must_exist] - Validate file path"
        echo ""
        echo "Examples:"
        echo "  $0 exists /path/to/file.txt"
        echo "  $0 write-file /tmp/test.txt 'Hello World'"
        echo "  $0 find-files . '*.js' 2"
        exit 1
        ;;
esac