# /critic:mentor

Generate constructive, growth-focused critique with encouraging guidance and development suggestions.

## Usage
```
critic:mentor --source "path/to/file.txt" [--domain thoughts] [--focus "structure,completeness"] [--audience beginner] [--compare "path/to/previous.json"] [--context "Additional context"]
```

## Parameters
- `--source`: Path to file or direct text content to critique (required)
- `--domain`: Context domain - research, content, thoughts, code, general (optional, defaults to general)
- `--focus`: Specific critique areas - logic, evidence, structure, style, ethics, completeness (optional, comma-separated)
- `--audience`: Target audience perspective - expert, general, beginner (optional)
- `--compare`: Path to previous critique for iterative improvement (optional)
- `--context`: Additional user-provided information (optional)

## Examples
```
critic:mentor --source "/notes/idea-draft.md" --domain "thoughts" --focus "structure,completeness" --audience "beginner"
critic:mentor --source "My code implementation..." --domain "code" --focus "logic,style"
```

## Output
Structured critique report with supportive, developmental feedback emphasizing learning and improvement.