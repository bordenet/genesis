package validator

import (
	"fmt"
	"os"
)

// Validator validates Genesis template consistency
type Validator struct {
	config        *Config
	scanner       *Scanner
	parser        *Parser
	linkValidator *LinkValidator
}

// NewValidator creates a new Validator
func NewValidator(config *Config) *Validator {
	return &Validator{
		config:        config,
		scanner:       NewScanner(config),
		parser:        NewParser(config),
		linkValidator: NewLinkValidator(config),
	}
}

// Validate performs comprehensive validation
func (v *Validator) Validate() (*ValidationResult, error) {
	result := &ValidationResult{
		ReferencedFiles: make(map[string][]string),
	}

	// Step 1: Scan for all template files (continue if templates dir doesn't exist)
	templates, err := v.scanner.ScanTemplates()
	if err != nil {
		// Only fail if it's not a "directory doesn't exist" error
		if !os.IsNotExist(err) {
			result.Errors = append(result.Errors, fmt.Errorf("failed to scan templates: %w", err))
			return result, err
		}
		// Templates dir doesn't exist - this is OK, continue with link validation
		if v.config.Verbose {
			fmt.Printf("Note: Templates directory not found, skipping template validation\n")
		}
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

	// Note: Doc consistency check between START-HERE.md and CHECKLIST.md was removed
	// because CHECKLIST.md is a high-level verification document that intentionally
	// doesn't list every template file. START-HERE.md is the single source of truth
	// for template references.

	// Step 6: Validate markdown links across all .md files
	brokenLinks, err := v.linkValidator.ValidateAllLinks()
	if err != nil {
		result.Errors = append(result.Errors, fmt.Errorf("failed to validate links: %w", err))
	} else {
		result.BrokenLinks = brokenLinks
		for _, link := range brokenLinks {
			result.Inconsistencies = append(result.Inconsistencies, Inconsistency{
				Type:        "broken_link",
				File:        link.SourceFile,
				Description: link.Reason,
				Location:    fmt.Sprintf("%s:%d", link.SourceFile, link.Line),
			})
		}
	}

	if v.config.Verbose {
		fmt.Printf("Found %d broken links\n", len(brokenLinks))
	}

	return result, nil
}
