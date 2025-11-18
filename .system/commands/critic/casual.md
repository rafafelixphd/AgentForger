# /critic:casual

Generate relatable, practical critique in everyday language with humor and real-world perspective.

## Usage
```
critic:casual --source "path/to/file.txt" [--domain general] [--focus "style,ethics"] [--audience general] [--compare "path/to/previous.json"] [--context "Additional context"]
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
critic:casual --source "/blog/post.md" --domain "content" --focus "style,ethics" --audience "general"
critic:casual --source "My presentation outline..." --domain "general" --focus "structure,completeness"
```

## Output
Structured critique report with approachable, humorous feedback using relatable language and practical advice.