package validator

import (
	"bufio"
	"os"
	"regexp"
	"strings"
)

// Parser parses documentation files to extract template references
type Parser struct {
	config *Config
}

// NewParser creates a new Parser
func NewParser(config *Config) *Parser {
	return &Parser{config: config}
}

// ParseReferences extracts all template file references from documentation
func (p *Parser) ParseReferences(docFile string) ([]string, error) {
	file, err := os.Open(docFile)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = file.Close()
	}()

	var references []string
	seen := make(map[string]bool)

	scanner := bufio.NewScanner(file)
	lineNum := 0

	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		// Extract template references from various patterns
		refs := p.extractReferences(line)
		for _, ref := range refs {
			if !seen[ref] {
				references = append(references, ref)
				seen[ref] = true
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return references, nil
}

// extractReferences extracts template file paths from a line
func (p *Parser) extractReferences(line string) []string {
	seen := make(map[string]bool)
	var refs []string

	// Exclusion list for special cases
	exclusions := map[string]bool{
		"templates/prd-template.md":             true, // Reference to external repo
		"templates/{document-type}-template.md": true, // Placeholder for user to create
		"templates/scripts/lib/compact.sh":      true, // Library file without -template suffix
	}

	addRef := func(ref string) {
		// Clean up the reference
		ref = strings.TrimSpace(ref)
		ref = strings.Trim(ref, "`\"'")

		// Skip if already seen, empty, or in exclusion list
		if ref == "" || seen[ref] || exclusions[ref] {
			return
		}

		refs = append(refs, ref)
		seen[ref] = true
	}

	// Pattern 1: cp genesis/templates/... (copy commands)
	// Example: cp genesis/templates/web-app/index-template.html index.html
	cpPattern := regexp.MustCompile(`cp\s+genesis/(templates/[^\s]+)`)
	if matches := cpPattern.FindStringSubmatch(line); len(matches) > 1 {
		addRef(matches[1])
		return refs // If we found a cp command, that's the primary reference
	}

	// Pattern 2: `templates/...` (backtick references)
	// Example: - [ ] `templates/web-app/index-template.html`
	backtickPattern := regexp.MustCompile("`(templates/[^`]+)`")
	if matches := backtickPattern.FindStringSubmatch(line); len(matches) > 1 {
		addRef(matches[1])
		return refs // If we found a backtick reference, use that
	}

	// Pattern 3: (from `...`) (parenthetical references)
	// Example: - [ ] `index.html` (from `web-app/index-template.html`)
	fromPattern := regexp.MustCompile(`\(from\s+\x60([^)]+)\x60\)`)
	if matches := fromPattern.FindStringSubmatch(line); len(matches) > 1 {
		path := matches[1]
		// Add templates/ prefix if not present
		if !strings.HasPrefix(path, "templates/") {
			path = "templates/" + path
		}
		addRef(path)
		return refs
	}

	// Pattern 4: Direct file references in documentation (only if no other patterns matched)
	// Example: See templates/CLAUDE.md.template for details
	if strings.Contains(line, "templates/") {
		// Extract templates/... paths
		directPattern := regexp.MustCompile(`templates/[a-zA-Z0-9/_.-]+`)
		matches := directPattern.FindAllString(line, -1)
		for _, match := range matches {
			addRef(match)
		}
	}

	return refs
}

// ParseAllDocs parses all documentation files and returns a map of file -> references
func (p *Parser) ParseAllDocs() (map[string][]string, error) {
	result := make(map[string][]string)

	// Parse START-HERE.md
	startRefs, err := p.ParseReferences(p.config.StartHereFile)
	if err != nil {
		return nil, err
	}
	result["START-HERE.md"] = startRefs

	// Parse 00-AI-MUST-READ-FIRST.md (formerly AI-EXECUTION-CHECKLIST.md)
	checklistRefs, err := p.ParseReferences(p.config.ChecklistFile)
	if err != nil {
		return nil, err
	}
	result["00-AI-MUST-READ-FIRST.md"] = checklistRefs

	return result, nil
}
