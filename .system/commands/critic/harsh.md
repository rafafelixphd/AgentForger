# /critic:harsh

Generate uncompromising academic-style critique with rigorous analysis and direct feedback.

## Usage
```
critic:harsh --source "path/to/file.txt" [--domain research] [--focus "logic,evidence"] [--audience expert] [--compare "path/to/previous.json"] [--context "Additional context"]
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
critic:harsh --source "/docs/research-paper.md" --domain "research" --focus "logic,evidence" --audience "expert"
critic:harsh --source "This is my blog post content..." --domain "content" --focus "style,structure"
```

## Output
Structured critique report with harsh, direct feedback focusing on academic rigor and methodological flaws.