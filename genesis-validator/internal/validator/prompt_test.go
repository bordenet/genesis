package validator

import (
	"errors"
	"strings"
	"testing"
)

func TestNewPromptGenerator(t *testing.T) {
	config := DefaultConfig()
	generator := NewPromptGenerator(config)

	if generator == nil {
		t.Fatal("NewPromptGenerator returned nil")
	}

	if generator.config != config {
		t.Error("PromptGenerator config not set correctly")
	}
}

func TestGeneratePrompt_ValidResult(t *testing.T) {
	config := DefaultConfig()
	generator := NewPromptGenerator(config)

	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt", "file2.txt"},
	}

	prompt := generator.GeneratePrompt(result)

	if prompt != "" {
		t.Errorf("Expected empty prompt for valid result, got: %s", prompt)
	}
}

func TestGeneratePrompt_WithErrors(t *testing.T) {
	config := DefaultConfig()
	generator := NewPromptGenerator(config)

	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt"},
		Errors:        []error{errors.New("test error 1"), errors.New("test error 2")},
	}

	prompt := generator.GeneratePrompt(result)

	if prompt == "" {
		t.Fatal("Expected non-empty prompt for result with errors")
	}

	// Check for expected sections
	expectedSections := []string{
		"Genesis Validation Failed",
		"Validation Summary",
		"Critical Errors",
		"test error 1",
		"test error 2",
		"Recommended Actions",
	}

	for _, section := range expectedSections {
		if !strings.Contains(prompt, section) {
			t.Errorf("Prompt missing expected section: %s", section)
		}
	}
}

func TestGeneratePrompt_WithOrphanedFiles(t *testing.T) {
	config := DefaultConfig()
	generator := NewPromptGenerator(config)

	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt", "file2.txt"},
		OrphanedFiles: []string{"orphan1.txt", "orphan2.txt"},
	}

	prompt := generator.GeneratePrompt(result)

	if prompt == "" {
		t.Fatal("Expected non-empty prompt for result with orphaned files")
	}

	expectedContent := []string{
		"Orphaned Template Files",
		"orphan1.txt",
		"orphan2.txt",
		"Add to START-HERE.md",
	}

	for _, content := range expectedContent {
		if !strings.Contains(prompt, content) {
			t.Errorf("Prompt missing expected content: %s", content)
		}
	}
}

func TestGeneratePrompt_WithMissingFiles(t *testing.T) {
	config := DefaultConfig()
	generator := NewPromptGenerator(config)

	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt"},
		MissingFiles:  []string{"missing1.txt", "missing2.txt"},
		ReferencedFiles: map[string][]string{
			"missing1.txt": {"START-HERE.md"},
			"missing2.txt": {"00-AI-MUST-READ-FIRST.md"},
		},
	}

	prompt := generator.GeneratePrompt(result)

	if prompt == "" {
		t.Fatal("Expected non-empty prompt for result with missing files")
	}

	expectedContent := []string{
		"Missing Template Files",
		"missing1.txt",
		"missing2.txt",
		"Referenced in: START-HERE.md",
		"Referenced in: 00-AI-MUST-READ-FIRST.md",
		"Create the template file",
	}

	for _, content := range expectedContent {
		if !strings.Contains(prompt, content) {
			t.Errorf("Prompt missing expected content: %s", content)
		}
	}
}

func TestGeneratePrompt_WithInconsistencies(t *testing.T) {
	// Note: Doc consistency check between START-HERE.md and CHECKLIST.md was removed
	// because CHECKLIST.md is a high-level verification document that intentionally
	// doesn't list every template file. START-HERE.md is the single source of truth.
	// This test now verifies that doc_mismatch inconsistencies are not displayed.

	config := DefaultConfig()
	generator := NewPromptGenerator(config)

	result := &ValidationResult{
		TemplateFiles: []string{"file1.txt"},
		// Even if doc_mismatch inconsistencies exist in the result,
		// they should not be displayed in the prompt
		Inconsistencies: []Inconsistency{
			{
				Type:        "doc_mismatch",
				File:        "test-file.txt",
				Description: "File referenced in START-HERE but not in checklist",
			},
		},
	}

	prompt := generator.GeneratePrompt(result)

	if prompt == "" {
		t.Fatal("Expected non-empty prompt even with only doc_mismatch inconsistencies")
	}

	// Verify doc_mismatch content is NOT displayed (since we removed this check)
	unexpectedContent := []string{
		"START-HERE.md ↔ 00-AI-MUST-READ-FIRST.md Mismatches",
		"START-HERE.md ↔ CHECKLIST.md Mismatches",
	}

	for _, content := range unexpectedContent {
		if strings.Contains(prompt, content) {
			t.Errorf("Prompt should NOT contain doc_mismatch content: %s", content)
		}
	}

	// Should still contain basic structure
	if !strings.Contains(prompt, "Validation Summary") {
		t.Error("Prompt should contain Validation Summary")
	}
}
