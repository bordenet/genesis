package validator

import (
	"fmt"
)

// Validator validates Genesis template consistency
type Validator struct {
	config  *Config
	scanner *Scanner
	parser  *Parser
}

// NewValidator creates a new Validator
func NewValidator(config *Config) *Validator {
	return &Validator{
		config:  config,
		scanner: NewScanner(config),
		parser:  NewParser(config),
	}
}

// Validate performs comprehensive validation
func (v *Validator) Validate() (*ValidationResult, error) {
	result := &ValidationResult{
		ReferencedFiles: make(map[string][]string),
	}

	// Step 1: Scan for all template files
	templates, err := v.scanner.ScanTemplates()
	if err != nil {
		result.Errors = append(result.Errors, fmt.Errorf("failed to scan templates: %w", err))
		return result, err
	}
	result.TemplateFiles = templates

	if v.config.Verbose {
		fmt.Printf("Found %d template files\n", len(templates))
	}

	// Step 2: Parse documentation for references
	docRefs, err := v.parser.ParseAllDocs()
	if err != nil {
		result.Errors = append(result.Errors, fmt.Errorf("failed to parse documentation: %w", err))
		return result, err
	}

	// Step 3: Build referenced files map
	referencedSet := make(map[string]bool)
	for doc, refs := range docRefs {
		for _, ref := range refs {
			result.ReferencedFiles[ref] = append(result.ReferencedFiles[ref], doc)
			referencedSet[ref] = true
		}
	}

	if v.config.Verbose {
		fmt.Printf("Found %d unique references across documentation\n", len(referencedSet))
	}

	// Step 4: Find orphaned files (templates not referenced in docs)
	for _, template := range templates {
		if !referencedSet[template] {
			result.OrphanedFiles = append(result.OrphanedFiles, template)
			result.Inconsistencies = append(result.Inconsistencies, Inconsistency{
				Type:        "orphaned_file",
				File:        template,
				Description: "Template file exists but is not referenced in any documentation",
			})
		}
	}

	// Step 5: Find missing files (referenced but don't exist)
	templateSet := make(map[string]bool)
	for _, template := range templates {
		templateSet[template] = true
	}

	for ref := range referencedSet {
		if !templateSet[ref] {
			result.MissingFiles = append(result.MissingFiles, ref)
			docs := result.ReferencedFiles[ref]
			result.Inconsistencies = append(result.Inconsistencies, Inconsistency{
				Type:        "missing_file",
				File:        ref,
				Description: "Referenced in documentation but file does not exist",
				Location:    fmt.Sprintf("Referenced in: %v", docs),
			})
		}
	}

	// Step 6: Check consistency between START-HERE.md and AI-EXECUTION-CHECKLIST.md
	v.checkDocConsistency(result, docRefs)

	return result, nil
}

// checkDocConsistency verifies that both documentation files reference the same templates
func (v *Validator) checkDocConsistency(result *ValidationResult, docRefs map[string][]string) {
	startRefs := make(map[string]bool)
	for _, ref := range docRefs["START-HERE.md"] {
		startRefs[ref] = true
	}

	checklistRefs := make(map[string]bool)
	for _, ref := range docRefs["AI-EXECUTION-CHECKLIST.md"] {
		checklistRefs[ref] = true
	}

	// Find files in START-HERE.md but not in AI-EXECUTION-CHECKLIST.md
	for ref := range startRefs {
		if !checklistRefs[ref] {
			result.Inconsistencies = append(result.Inconsistencies, Inconsistency{
				Type:        "doc_mismatch",
				File:        ref,
				Description: "Referenced in START-HERE.md but not in AI-EXECUTION-CHECKLIST.md",
				Location:    "START-HERE.md",
			})
		}
	}

	// Find files in AI-EXECUTION-CHECKLIST.md but not in START-HERE.md
	for ref := range checklistRefs {
		if !startRefs[ref] {
			result.Inconsistencies = append(result.Inconsistencies, Inconsistency{
				Type:        "doc_mismatch",
				File:        ref,
				Description: "Referenced in AI-EXECUTION-CHECKLIST.md but not in START-HERE.md",
				Location:    "AI-EXECUTION-CHECKLIST.md",
			})
		}
	}
}
