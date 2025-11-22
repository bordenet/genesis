package validator

import (
	"os"
	"path/filepath"
	"testing"
)

func TestScanner_isTemplateFile(t *testing.T) {
	config := DefaultConfig()
	scanner := NewScanner(config)

	tests := []struct {
		name     string
		filename string
		want     bool
	}{
		{"template with dash", "index-template.html", true},
		{"template with dot", "deploy-web.sh.template", true},
		{"template in middle", "app-template.js", true},
		{"not a template", "README.md", false},
		{"not a template", "app.js", false},
		{"template substring", "implementation.md", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := scanner.isTemplateFile(tt.filename)
			if got != tt.want {
				t.Errorf("isTemplateFile(%q) = %v, want %v", tt.filename, got, tt.want)
			}
		})
	}
}

func TestScanner_ScanTemplates(t *testing.T) {
	// Create temporary test directory structure
	tmpDir := t.TempDir()
	genesisDir := filepath.Join(tmpDir, "genesis")
	templatesDir := filepath.Join(genesisDir, "templates")

	// Create test template files
	testFiles := []string{
		"templates/web-app/index-template.html",
		"templates/web-app/js/app-template.js",
		"templates/scripts/deploy-web.sh.template",
		"templates/CLAUDE.md.template",
		"templates/README.md", // Not a template
	}

	for _, file := range testFiles {
		fullPath := filepath.Join(genesisDir, file)
		if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
			t.Fatalf("Failed to create directory: %v", err)
		}
		if err := os.WriteFile(fullPath, []byte("test content"), 0644); err != nil {
			t.Fatalf("Failed to create file: %v", err)
		}
	}

	// Create scanner with test config
	config := &Config{
		GenesisRoot:  genesisDir,
		TemplatesDir: templatesDir,
	}
	scanner := NewScanner(config)

	// Scan templates
	templates, err := scanner.ScanTemplates()
	if err != nil {
		t.Fatalf("ScanTemplates() error = %v", err)
	}

	// Should find 4 template files (excluding README.md)
	expectedCount := 4
	if len(templates) != expectedCount {
		t.Errorf("ScanTemplates() found %d files, want %d", len(templates), expectedCount)
		t.Logf("Found files: %v", templates)
	}

	// Verify specific files are found
	expectedFiles := map[string]bool{
		"templates/web-app/index-template.html":    true,
		"templates/web-app/js/app-template.js":     true,
		"templates/scripts/deploy-web.sh.template": true,
		"templates/CLAUDE.md.template":             true,
	}

	for _, file := range templates {
		if !expectedFiles[file] {
			t.Errorf("Unexpected file found: %s", file)
		}
	}
}

func TestScanner_FileExists(t *testing.T) {
	tmpDir := t.TempDir()
	testFile := filepath.Join(tmpDir, "test.txt")

	config := DefaultConfig()
	scanner := NewScanner(config)

	// File doesn't exist yet
	if scanner.FileExists(testFile) {
		t.Errorf("FileExists() = true for non-existent file")
	}

	// Create file
	if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// File exists now
	if !scanner.FileExists(testFile) {
		t.Errorf("FileExists() = false for existing file")
	}
}

