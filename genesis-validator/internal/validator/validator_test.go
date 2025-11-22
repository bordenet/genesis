package validator

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func setupTestEnvironment(t *testing.T) (string, *Config) {
	tmpDir := t.TempDir()
	genesisDir := filepath.Join(tmpDir, "genesis")
	templatesDir := filepath.Join(genesisDir, "templates")

	// Create template files
	templateFiles := []string{
		"templates/web-app/index-template.html",
		"templates/web-app/js/app-template.js",
		"templates/CLAUDE.md.template",
	}

	for _, file := range templateFiles {
		fullPath := filepath.Join(genesisDir, file)
		if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
			t.Fatalf("Failed to create directory: %v", err)
		}
		if err := os.WriteFile(fullPath, []byte("test content"), 0644); err != nil {
			t.Fatalf("Failed to create file: %v", err)
		}
	}

	// Create START-HERE.md
	startHereContent := `# START-HERE

## Copy templates
cp genesis/templates/web-app/index-template.html index.html
cp genesis/templates/web-app/js/app-template.js js/app.js
cp genesis/templates/CLAUDE.md.template CLAUDE.md
`
	startHereFile := filepath.Join(genesisDir, "START-HERE.md")
	if err := os.WriteFile(startHereFile, []byte(startHereContent), 0644); err != nil {
		t.Fatalf("Failed to create START-HERE.md: %v", err)
	}

	// Create AI-EXECUTION-CHECKLIST.md
	checklistContent := `# Checklist

- [ ] \x60templates/web-app/index-template.html\x60
- [ ] \x60templates/web-app/js/app-template.js\x60
- [ ] \x60templates/CLAUDE.md.template\x60
`
	checklistFile := filepath.Join(genesisDir, "AI-EXECUTION-CHECKLIST.md")
	if err := os.WriteFile(checklistFile, []byte(checklistContent), 0644); err != nil {
		t.Fatalf("Failed to create AI-EXECUTION-CHECKLIST.md: %v", err)
	}

	config := &Config{
		GenesisRoot:   genesisDir,
		TemplatesDir:  templatesDir,
		StartHereFile: startHereFile,
		ChecklistFile: checklistFile,
		Verbose:       false,
	}

	return tmpDir, config
}

func TestValidator_Validate_Success(t *testing.T) {
	_, config := setupTestEnvironment(t)

	v := NewValidator(config)
	result, err := v.Validate()

	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	if !result.IsValid() {
		t.Errorf("Validate() expected valid result, got invalid")
		t.Logf("Orphaned: %v", result.OrphanedFiles)
		t.Logf("Missing: %v", result.MissingFiles)
		t.Logf("Errors: %v", result.Errors)
	}

	if len(result.TemplateFiles) != 3 {
		t.Errorf("Validate() found %d templates, want 3", len(result.TemplateFiles))
	}
}

func TestValidator_Validate_OrphanedFile(t *testing.T) {
	tmpDir, config := setupTestEnvironment(t)

	// Add an orphaned template file
	orphanedFile := filepath.Join(tmpDir, "genesis/templates/orphaned-template.js")
	if err := os.WriteFile(orphanedFile, []byte("orphaned"), 0644); err != nil {
		t.Fatalf("Failed to create orphaned file: %v", err)
	}

	v := NewValidator(config)
	result, err := v.Validate()

	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	if result.IsValid() {
		t.Errorf("Validate() expected invalid result due to orphaned file")
	}

	if len(result.OrphanedFiles) != 1 {
		t.Errorf("Validate() found %d orphaned files, want 1", len(result.OrphanedFiles))
	}
}

func TestValidator_Validate_MissingFile(t *testing.T) {
	tmpDir, config := setupTestEnvironment(t)

	// Add reference to non-existent file in START-HERE.md
	startHereFile := filepath.Join(tmpDir, "genesis/START-HERE.md")
	content, _ := os.ReadFile(startHereFile)
	newContent := string(content) + "\ncp genesis/templates/missing-template.js missing.js\n"
	if err := os.WriteFile(startHereFile, []byte(newContent), 0644); err != nil {
		t.Fatalf("Failed to update START-HERE.md: %v", err)
	}

	v := NewValidator(config)
	result, err := v.Validate()

	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	if result.IsValid() {
		t.Errorf("Validate() expected invalid result due to missing file")
	}

	if len(result.MissingFiles) != 1 {
		t.Errorf("Validate() found %d missing files, want 1", len(result.MissingFiles))
	}
}

func TestValidationResult_Summary(t *testing.T) {
	result := &ValidationResult{
		TemplateFiles: []string{"file1", "file2"},
		OrphanedFiles: []string{},
		MissingFiles:  []string{},
	}

	summary := result.Summary()
	if summary == "" {
		t.Error("Summary() returned empty string")
	}

	if !result.IsValid() {
		t.Error("IsValid() should return true for valid result")
	}
}

func TestValidationResult_Summary_Valid(t *testing.T) {
	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt", "file2.txt", "file3.txt"},
	}

	summary := result.Summary()

	if !strings.Contains(summary, "All checks passed") {
		t.Errorf("Expected 'All checks passed' in summary, got: %s", summary)
	}

	if !strings.Contains(summary, "3 template files") {
		t.Errorf("Expected '3 template files' in summary, got: %s", summary)
	}
}

func TestValidationResult_Summary_WithErrors(t *testing.T) {
	result := &ValidationResult{
		TemplateFiles:   []string{"file1.txt"},
		OrphanedFiles:   []string{"orphan1.txt", "orphan2.txt"},
		MissingFiles:    []string{"missing1.txt"},
		Inconsistencies: []Inconsistency{{Type: "test", File: "test.txt", Description: "test"}},
		Errors:          []error{errors.New("test error")},
	}

	summary := result.Summary()

	expectedContent := []string{
		"Validation Summary",
		"Template files found: 1",
		"Orphaned files: 2",
		"Missing files: 1",
		"Inconsistencies: 1",
		"Errors: 1",
	}

	for _, content := range expectedContent {
		if !strings.Contains(summary, content) {
			t.Errorf("Summary missing expected content: %s\nGot: %s", content, summary)
		}
	}
}

func TestValidationResult_Summary_WithWarnings(t *testing.T) {
	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt"},
		OrphanedFiles: []string{"orphan1.txt"},
	}

	summary := result.Summary()

	if strings.Contains(summary, "All checks passed") {
		t.Error("Summary should not say 'All checks passed' when there are warnings")
	}

	if !strings.Contains(summary, "Orphaned files: 1") {
		t.Errorf("Summary should mention orphaned files, got: %s", summary)
	}
}

func TestValidationResult_IsValid(t *testing.T) {
	tests := []struct {
		name     string
		result   *ValidationResult
		expected bool
	}{
		{
			name: "valid result",
			result: &ValidationResult{
				TemplateFiles: []string{"file1.txt"},
			},
			expected: true,
		},
		{
			name: "with errors",
			result: &ValidationResult{
				TemplateFiles: []string{"file1.txt"},
				Errors:        []error{errors.New("test error")},
			},
			expected: false,
		},
		{
			name: "with missing files",
			result: &ValidationResult{
				TemplateFiles: []string{"file1.txt"},
				MissingFiles:  []string{"missing.txt"},
			},
			expected: false,
		},
		{
			name: "with orphaned files",
			result: &ValidationResult{
				TemplateFiles: []string{"file1.txt"},
				OrphanedFiles: []string{"orphan.txt"},
			},
			expected: false,
		},
		{
			name: "with inconsistencies only (still valid)",
			result: &ValidationResult{
				TemplateFiles:   []string{"file1.txt"},
				Inconsistencies: []Inconsistency{{Type: "test", File: "test.txt", Description: "test"}},
			},
			expected: true, // IsValid only checks orphaned, missing, and errors
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.result.IsValid(); got != tt.expected {
				t.Errorf("IsValid() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestValidationResult_HasWarnings(t *testing.T) {
	tests := []struct {
		name     string
		result   *ValidationResult
		expected bool
	}{
		{
			name: "no warnings",
			result: &ValidationResult{
				TemplateFiles: []string{"file1.txt"},
			},
			expected: false,
		},
		{
			name: "with inconsistencies",
			result: &ValidationResult{
				TemplateFiles:   []string{"file1.txt"},
				Inconsistencies: []Inconsistency{{Type: "test", File: "test.txt", Description: "test"}},
			},
			expected: true,
		},
		{
			name: "with orphaned files only (no warnings)",
			result: &ValidationResult{
				TemplateFiles: []string{"file1.txt"},
				OrphanedFiles: []string{"orphan.txt"},
			},
			expected: false, // HasWarnings only checks inconsistencies
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.result.HasWarnings(); got != tt.expected {
				t.Errorf("HasWarnings() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestDefaultConfig(t *testing.T) {
	config := DefaultConfig()

	if config == nil {
		t.Fatal("DefaultConfig returned nil")
	}

	if config.GenesisRoot != "genesis" {
		t.Errorf("Expected GenesisRoot 'genesis', got '%s'", config.GenesisRoot)
	}

	if config.TemplatesDir != "genesis/templates" {
		t.Errorf("Expected TemplatesDir 'genesis/templates', got '%s'", config.TemplatesDir)
	}

	if config.StartHereFile != "genesis/START-HERE.md" {
		t.Errorf("Expected StartHereFile 'genesis/START-HERE.md', got '%s'", config.StartHereFile)
	}

	if config.ChecklistFile != "genesis/AI-EXECUTION-CHECKLIST.md" {
		t.Errorf("Expected ChecklistFile 'genesis/AI-EXECUTION-CHECKLIST.md', got '%s'", config.ChecklistFile)
	}
}

