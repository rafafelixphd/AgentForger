#!/bin/bash
# counter.sh - Character and word counting utilities
# Provides comprehensive text analysis for content validation

# Function to count characters (excluding whitespace)
count_chars() {
    local text="$1"
    echo -n "$text" | tr -d '[:space:]' | wc -c
}

# Function to count characters (including whitespace)
count_chars_with_spaces() {
    local text="$1"
    echo -n "$text" | wc -c
}

# Function to count words
count_words() {
    local text="$1"
    echo "$text" | wc -w | tr -d ' '
}

# Function to count lines
count_lines() {
    local text="$1"
    echo "$text" | wc -l | tr -d ' '
}

# Function to count sentences (basic implementation)
count_sentences() {
    local text="$1"
    # Count periods, exclamation marks, and question marks as sentence endings
    echo "$text" | grep -o '[.!?]' | wc -l
}

# Function to estimate reading time (words per minute)
estimate_reading_time() {
    local text="$1"
    local wpm="${2:-200}"  # Default 200 words per minute

    local word_count=$(count_words "$text")
    local minutes=$(( word_count / wpm ))
    local seconds=$(( (word_count % wpm) * 60 / wpm ))

    echo "${minutes}m ${seconds}s"
}

# Function to get text statistics (JSON format)
get_text_stats() {
    local text="$1"

    local chars_no_spaces=$(count_chars "$text")
    local chars_with_spaces=$(count_chars_with_spaces "$text")
    local words=$(count_words "$text")
    local lines=$(count_lines "$text")
    local sentences=$(count_sentences "$text")
    local reading_time=$(estimate_reading_time "$text")

    cat << EOF
{
  "characters": {
    "without_spaces": $chars_no_spaces,
    "with_spaces": $chars_with_spaces
  },
  "words": $words,
  "lines": $lines,
  "sentences": $sentences,
  "reading_time": "$reading_time",
  "average_words_per_sentence": $(($sentences > 0 ? $words / $sentences : 0)),
  "average_chars_per_word": $(($words > 0 ? $chars_no_spaces / $words : 0))
}
EOF
}

# Function to check if text meets length requirements
check_length_requirements() {
    local text="$1"
    local min_length="${2:-0}"
    local max_length="${3:-999999}"

    local char_count=$(count_chars_with_spaces "$text")

    if [ "$char_count" -lt "$min_length" ]; then
        echo "TOO_SHORT"
        return 1
    elif [ "$char_count" -gt "$max_length" ]; then
        echo "TOO_LONG"
        return 1
    else
        echo "OK"
        return 0
    fi
}

# Function to analyze text complexity
analyze_complexity() {
    local text="$1"

    local word_count=$(count_words "$text")
    local sentence_count=$(count_sentences "$text")
    local char_count=$(count_chars "$text")

    # Calculate metrics
    local avg_sentence_length=$((sentence_count > 0 ? word_count / sentence_count : 0))
    local avg_word_length=$((word_count > 0 ? char_count / word_count : 0))

    # Determine complexity level
    local complexity="UNKNOWN"
    if [ "$avg_sentence_length" -lt 10 ] && [ "$avg_word_length" -lt 4 ]; then
        complexity="SIMPLE"
    elif [ "$avg_sentence_length" -lt 15 ] && [ "$avg_word_length" -lt 5 ]; then
        complexity="MODERATE"
    elif [ "$avg_sentence_length" -lt 20 ] && [ "$avg_word_length" -lt 6 ]; then
        complexity="COMPLEX"
    else
        complexity="VERY_COMPLEX"
    fi

    cat << EOF
{
  "complexity_level": "$complexity",
  "average_sentence_length": $avg_sentence_length,
  "average_word_length": $avg_word_length,
  "total_words": $word_count,
  "total_sentences": $sentence_count
}
EOF
}

# Main execution logic
case "$1" in
    chars)
        count_chars "$2"
        ;;
    chars-spaces)
        count_chars_with_spaces "$2"
        ;;
    words)
        count_words "$2"
        ;;
    lines)
        count_lines "$2"
        ;;
    sentences)
        count_sentences "$2"
        ;;
    reading-time)
        estimate_reading_time "$2" "$3"
        ;;
    stats)
        get_text_stats "$2"
        ;;
    check-length)
        check_length_requirements "$2" "$3" "$4"
        ;;
    complexity)
        analyze_complexity "$2"
        ;;
    *)
        echo "Usage: $0 {chars|chars-spaces|words|lines|sentences|reading-time|stats|check-length|complexity} [args...]"
        echo ""
        echo "Examples:"
        echo "  $0 words \"Hello world\""
        echo "  $0 stats \"This is a test sentence.\""
        echo "  $0 check-length \"Short text\" 10 100"
        echo "  $0 reading-time \"Long text here...\" 250"
        exit 1
        ;;
esac