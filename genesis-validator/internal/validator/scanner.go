package validator

import (
	"os"
	"path/filepath"
	"strings"
)

// Scanner scans the genesis directory for template files
type Scanner struct {
	config *Config
}

// NewScanner creates a new Scanner
func NewScanner(config *Config) *Scanner {
	return &Scanner{config: config}
}

// ScanTemplates finds all template files in the genesis/templates directory
func (s *Scanner) ScanTemplates() ([]string, error) {
	var templates []string

	err := filepath.Walk(s.config.TemplatesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Check if file is a template (ends with -template* or .template)
		if s.isTemplateFile(info.Name()) {
			// Store relative path from genesis root
			relPath, err := filepath.Rel(s.config.GenesisRoot, path)
			if err != nil {
				return err
			}
			templates = append(templates, relPath)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return templates, nil
}

// isTemplateFile checks if a filename matches template naming conventions
func (s *Scanner) isTemplateFile(filename string) bool {
	// Check for -template suffix (e.g., index-template.html)
	if strings.Contains(filename, "-template") {
		return true
	}

	// Check for .template suffix (e.g., deploy-web.sh.template)
	if strings.HasSuffix(filename, ".template") {
		return true
	}

	return false
}

// FileExists checks if a file exists
func (s *Scanner) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

