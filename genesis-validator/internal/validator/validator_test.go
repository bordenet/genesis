package validator

import (
	"os"
	"path/filepath"
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

