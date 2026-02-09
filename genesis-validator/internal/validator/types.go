package validator

import "fmt"

// ValidationResult represents the result of a Genesis validation
type ValidationResult struct {
	TemplateFiles   []string
	ReferencedFiles map[string][]string // file -> list of docs that reference it
	OrphanedFiles   []string
	MissingFiles    []string
	BrokenLinks     []BrokenLink // Broken markdown links
	Inconsistencies []Inconsistency
	Errors          []error
}

// Inconsistency represents a discrepancy between documentation files
type Inconsistency struct {
	Type        string // "missing_reference", "orphaned_file", "doc_mismatch"
	File        string
	Description string
	Location    string // e.g., "START-HERE.md:line 123"
}

// IsValid returns true if validation passed with no critical issues
func (r *ValidationResult) IsValid() bool {
	return len(r.OrphanedFiles) == 0 &&
		len(r.MissingFiles) == 0 &&
		len(r.BrokenLinks) == 0 &&
		len(r.Errors) == 0
}

// HasWarnings returns true if there are non-critical issues
func (r *ValidationResult) HasWarnings() bool {
	return len(r.Inconsistencies) > 0
}

// Summary returns a human-readable summary
func (r *ValidationResult) Summary() string {
	if r.IsValid() && !r.HasWarnings() {
		return fmt.Sprintf("✅ All checks passed! Found %d template files, all referenced correctly.",
			len(r.TemplateFiles))
	}

	summary := "📊 Validation Summary:\n"
	summary += fmt.Sprintf("  Template files found: %d\n", len(r.TemplateFiles))
	summary += fmt.Sprintf("  Orphaned files: %d\n", len(r.OrphanedFiles))
	summary += fmt.Sprintf("  Missing files: %d\n", len(r.MissingFiles))
	summary += fmt.Sprintf("  Broken links: %d\n", len(r.BrokenLinks))
	summary += fmt.Sprintf("  Inconsistencies: %d\n", len(r.Inconsistencies))
	summary += fmt.Sprintf("  Errors: %d\n", len(r.Errors))

	return summary
}

// Config holds configuration for the validator
type Config struct {
	GenesisRoot    string
	TemplatesDir   string
	StartHereFile  string
	ChecklistFile  string
	Verbose        bool
	GeneratePrompt bool
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		GenesisRoot:    "genesis",
		TemplatesDir:   "genesis/templates",
		StartHereFile:  "genesis/START-HERE.md",
		ChecklistFile:  "genesis/CHECKLIST.md",
		Verbose:        false,
		GeneratePrompt: true,
	}
}
