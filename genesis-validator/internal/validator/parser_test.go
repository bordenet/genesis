package validator

import (
	"os"
	"path/filepath"
	"testing"
)

func TestParser_extractReferences(t *testing.T) {
	config := DefaultConfig()
	parser := NewParser(config)

	tests := []struct {
		name string
		line string
		want []string
	}{
		{
			name: "cp command",
			line: "cp genesis/templates/web-app/index-template.html index.html",
			want: []string{"templates/web-app/index-template.html"},
		},
		{
			name: "backtick reference",
			line: "- [ ] `templates/web-app/index-template.html`",
			want: []string{"templates/web-app/index-template.html"},
		},
		{
			name: "from reference",
			line: "- [ ] `index.html` (from `web-app/index-template.html`)",
			want: []string{"templates/web-app/index-template.html"},
		},
		{
			name: "direct reference",
			line: "See templates/CLAUDE.md.template for details",
			want: []string{"templates/CLAUDE.md.template"},
		},
		{
			name: "no reference",
			line: "This is a regular line with no templates",
			want: []string{},
		},
		{
			name: "multiple references in direct pattern",
			line: "See templates/web-app/index-template.html and templates/web-app/js/app-template.js",
			want: []string{"templates/web-app/index-template.html", "templates/web-app/js/app-template.js"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parser.extractReferences(tt.line)
			if len(got) != len(tt.want) {
				t.Errorf("extractReferences() got %d refs, want %d", len(got), len(tt.want))
				t.Logf("Got: %v", got)
				t.Logf("Want: %v", tt.want)
				return
			}
			for i, ref := range got {
				if ref != tt.want[i] {
					t.Errorf("extractReferences()[%d] = %q, want %q", i, ref, tt.want[i])
				}
			}
		})
	}
}

func TestParser_ParseReferences(t *testing.T) {
	// Create temporary test file
	tmpDir := t.TempDir()
	testFile := filepath.Join(tmpDir, "test.md")

	content := `# Test Document

## Section 1
cp genesis/templates/web-app/index-template.html index.html

## Section 2
- [ ] \x60templates/web-app/js/app-template.js\x60
- [ ] \x60index.html\x60 (from \x60web-app/index-template.html\x60)

See templates/CLAUDE.md.template for more info.
`

	if err := os.WriteFile(testFile, []byte(content), 0644); err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	config := DefaultConfig()
	parser := NewParser(config)

	refs, err := parser.ParseReferences(testFile)
	if err != nil {
		t.Fatalf("ParseReferences() error = %v", err)
	}

	// Should find at least 3 unique references
	if len(refs) < 3 {
		t.Errorf("ParseReferences() found %d refs, want at least 3", len(refs))
		t.Logf("Found: %v", refs)
	}

	// Check for specific references
	expectedRefs := map[string]bool{
		"templates/web-app/index-template.html": false,
		"templates/web-app/js/app-template.js":  false,
		"templates/CLAUDE.md.template":          false,
	}

	for _, ref := range refs {
		if _, ok := expectedRefs[ref]; ok {
			expectedRefs[ref] = true
		}
	}

	for ref, found := range expectedRefs {
		if !found {
			t.Errorf("Expected reference not found: %s", ref)
		}
	}
}

func TestParser_ParseReferences_NonExistentFile(t *testing.T) {
	config := DefaultConfig()
	parser := NewParser(config)

	_, err := parser.ParseReferences("/nonexistent/file.md")
	if err == nil {
		t.Error("ParseReferences() expected error for non-existent file, got nil")
	}
}
