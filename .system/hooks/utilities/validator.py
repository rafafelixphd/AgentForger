#!/usr/bin/env python3
# validator.py - Validation utilities for pipeline data
# Provides comprehensive validation for different data types and constraints

import json
import re
import os
import sys
from typing import Dict, List, Any, Optional, Union, Callable
from datetime import datetime
import urllib.parse

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class Validator:
    """Main validation class with various validation methods"""

    def __init__(self):
        self.errors = []
        self.warnings = []

    def reset(self):
        """Reset validation state"""
        self.errors = []
        self.warnings = []

    def add_error(self, message: str):
        """Add an error message"""
        self.errors.append(message)

    def add_warning(self, message: str):
        """Add a warning message"""
        self.warnings.append(message)

    def is_valid(self) -> bool:
        """Check if validation passed"""
        return len(self.errors) == 0

    def get_results(self) -> Dict[str, Any]:
        """Get validation results"""
        return {
            'valid': self.is_valid(),
            'errors': self.errors,
            'warnings': self.warnings,
            'error_count': len(self.errors),
            'warning_count': len(self.warnings)
        }

    def validate_text_length(self, text: str, min_length: int = 0, max_length: Optional[int] = None) -> bool:
        """Validate text length constraints"""
        if not isinstance(text, str):
            self.add_error("Input must be a string")
            return False

        length = len(text)

        if length < min_length:
            self.add_error(f"Text too short: {length} characters (minimum: {min_length})")
            return False

        if max_length and length > max_length:
            self.add_error(f"Text too long: {length} characters (maximum: {max_length})")
            return False

        return True

    def validate_word_count(self, text: str, min_words: int = 0, max_words: Optional[int] = None) -> bool:
        """Validate word count constraints"""
        if not isinstance(text, str):
            self.add_error("Input must be a string")
            return False

        words = text.split()
        word_count = len(words)

        if word_count < min_words:
            self.add_error(f"Too few words: {word_count} (minimum: {min_words})")
            return False

        if max_words and word_count > max_words:
            self.add_error(f"Too many words: {word_count} (maximum: {max_words})")
            return False

        return True

    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        if not isinstance(email, str):
            self.add_error("Email must be a string")
            return False

        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            self.add_error(f"Invalid email format: {email}")
            return False

        return True

    def validate_url(self, url: str) -> bool:
        """Validate URL format"""
        if not isinstance(url, str):
            self.add_error("URL must be a string")
            return False

        try:
            result = urllib.parse.urlparse(url)
            if not result.scheme or not result.netloc:
                self.add_error(f"Invalid URL format: {url}")
                return False
        except Exception as e:
            self.add_error(f"URL validation error: {str(e)}")
            return False

        return True

    def validate_json(self, json_str: str) -> bool:
        """Validate JSON format"""
        if not isinstance(json_str, str):
            self.add_error("JSON input must be a string")
            return False

        try:
            json.loads(json_str)
        except json.JSONDecodeError as e:
            self.add_error(f"Invalid JSON: {str(e)}")
            return False

        return True

    def validate_file_exists(self, file_path: str) -> bool:
        """Validate file exists"""
        if not isinstance(file_path, str):
            self.add_error("File path must be a string")
            return False

        if not os.path.exists(file_path):
            self.add_error(f"File does not exist: {file_path}")
            return False

        return True

    def validate_file_extension(self, file_path: str, allowed_extensions: List[str]) -> bool:
        """Validate file extension"""
        if not isinstance(file_path, str):
            self.add_error("File path must be a string")
            return False

        if not isinstance(allowed_extensions, list):
            self.add_error("Allowed extensions must be a list")
            return False

        _, ext = os.path.splitext(file_path)
        ext = ext.lower()

        if ext not in [e.lower() for e in allowed_extensions]:
            self.add_error(f"Invalid file extension: {ext}. Allowed: {', '.join(allowed_extensions)}")
            return False

        return True

    def validate_date_format(self, date_str: str, format_str: str = "%Y-%m-%d") -> bool:
        """Validate date format"""
        if not isinstance(date_str, str):
            self.add_error("Date must be a string")
            return False

        try:
            datetime.strptime(date_str, format_str)
        except ValueError as e:
            self.add_error(f"Invalid date format: {str(e)}")
            return False

        return True

    def validate_numeric_range(self, value: Union[int, float], min_val: Optional[Union[int, float]] = None,
                             max_val: Optional[Union[int, float]] = None) -> bool:
        """Validate numeric range"""
        if not isinstance(value, (int, float)):
            self.add_error("Value must be numeric")
            return False

        if min_val is not None and value < min_val:
            self.add_error(f"Value too small: {value} (minimum: {min_val})")
            return False

        if max_val is not None and value > max_val:
            self.add_error(f"Value too large: {value} (maximum: {max_val})")
            return False

        return True

    def validate_list_items(self, items: List[Any], item_validator: Optional[Callable[[Any], bool]] = None,
                          min_items: int = 0, max_items: Optional[int] = None) -> bool:
        """Validate list items"""
        if not isinstance(items, list):
            self.add_error("Input must be a list")
            return False

        item_count = len(items)

        if item_count < min_items:
            self.add_error(f"Too few items: {item_count} (minimum: {min_items})")
            return False

        if max_items and item_count > max_items:
            self.add_error(f"Too many items: {item_count} (maximum: {max_items})")
            return False

        if item_validator:
            for i, item in enumerate(items):
                try:
                    if not item_validator(item):
                        self.add_error(f"Invalid item at index {i}: {item}")
                        return False
                except Exception as e:
                    self.add_error(f"Validation error for item at index {i}: {str(e)}")
                    return False

        return True

    def validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> bool:
        """Validate required fields in dictionary"""
        if not isinstance(data, dict):
            self.add_error("Data must be a dictionary")
            return False

        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None:
                missing_fields.append(field)

        if missing_fields:
            self.add_error(f"Missing required fields: {', '.join(missing_fields)}")
            return False

        return True

    def validate_platform_content(self, content: str, platform: str) -> bool:
        """Validate content for specific platform constraints"""
        if not isinstance(content, str):
            self.add_error("Content must be a string")
            return False

        platform = platform.lower()

        if platform == 'linkedin':
            # LinkedIn character limit
            if len(content) > 3000:
                self.add_error(f"LinkedIn content too long: {len(content)} characters (max: 3000)")
                return False

        elif platform == 'twitter' or platform == 'x':
            # Twitter character limit
            if len(content) > 280:
                self.add_error(f"Twitter content too long: {len(content)} characters (max: 280)")
                return False

        elif platform == 'conversation':
            # Conversation message size limit
            if len(content) > 40000:
                self.add_error(f"Conversation content too long: {len(content)} characters (max: ~40000)")
                return False

        return True

    def validate_workflow_config(self, config: Dict[str, Any]) -> bool:
        """Validate workflow configuration"""
        if not isinstance(config, dict):
            self.add_error("Workflow config must be a dictionary")
            return False

        # Check required fields
        required = ['name', 'phases']
        if not self.validate_required_fields(config, required):
            return False

        # Validate phases
        if not isinstance(config['phases'], list) or len(config['phases']) == 0:
            self.add_error("Workflow must have at least one phase")
            return False

        for i, phase in enumerate(config['phases']):
            if not isinstance(phase, dict):
                self.add_error(f"Phase {i} must be a dictionary")
                return False

            if 'name' not in phase:
                self.add_error(f"Phase {i} missing 'name' field")
                return False

        return True

def validate_text_length(text: str, min_length: int = 0, max_length: Optional[int] = None) -> Dict[str, Any]:
    """Standalone text length validation"""
    validator = Validator()
    validator.validate_text_length(text, min_length, max_length)
    return validator.get_results()

def validate_email_format(email: str) -> Dict[str, Any]:
    """Standalone email validation"""
    validator = Validator()
    validator.validate_email(email)
    return validator.get_results()

def validate_url_format(url: str) -> Dict[str, Any]:
    """Standalone URL validation"""
    validator = Validator()
    validator.validate_url(url)
    return validator.get_results()

def validate_json_format(json_str: str) -> Dict[str, Any]:
    """Standalone JSON validation"""
    validator = Validator()
    validator.validate_json(json_str)
    return validator.get_results()

def validate_file_exists(file_path: str) -> Dict[str, Any]:
    """Standalone file existence validation"""
    validator = Validator()
    validator.validate_file_exists(file_path)
    return validator.get_results()

def validate_platform_content(content: str, platform: str) -> Dict[str, Any]:
    """Standalone platform content validation"""
    validator = Validator()
    validator.validate_platform_content(content, platform)
    return validator.get_results()

def main():
    """Main execution logic"""
    if len(sys.argv) < 3:
        print("Usage: python3 validator.py <command> <input> [args...]")
        print("")
        print("Commands:")
        print("  text-length <text> <min> [max]     - Validate text length")
        print("  email <email>                      - Validate email format")
        print("  url <url>                          - Validate URL format")
        print("  json <json_string>                 - Validate JSON format")
        print("  file-exists <path>                 - Check if file exists")
        print("  platform <content> <platform>      - Validate platform content")
        print("")
        print("Examples:")
        print('  python3 validator.py text-length "Hello" 1 100')
        print('  python3 validator.py email "user@example.com"')
        print('  python3 validator.py json \'{"name": "test"}\'')
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    try:
        if command == 'text-length':
            text = args[0]
            min_len = int(args[1]) if len(args) > 1 else 0
            max_len = int(args[2]) if len(args) > 2 else None
            result = validate_text_length(text, min_len, max_len)

        elif command == 'email':
            result = validate_email_format(args[0])

        elif command == 'url':
            result = validate_url_format(args[0])

        elif command == 'json':
            result = validate_json_format(args[0])

        elif command == 'file-exists':
            result = validate_file_exists(args[0])

        elif command == 'platform':
            result = validate_platform_content(args[0], args[1])

        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

        # Output results as JSON
        print(json.dumps(result, indent=2))

    except Exception as e:
        error_result = {
            'valid': False,
            'errors': [f'Validation error: {str(e)}'],
            'warnings': [],
            'error_count': 1,
            'warning_count': 0
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()