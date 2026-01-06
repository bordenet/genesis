package validator

import (
	"fmt"
	"strings"
)

// PromptGenerator generates LLM prompts for validation issues
type PromptGenerator struct {
	config *Config
}

// NewPromptGenerator creates a new PromptGenerator
func NewPromptGenerator(config *Config) *PromptGenerator {
	return &PromptGenerator{config: config}
}

// GeneratePrompt creates a detailed LLM prompt for fixing validation issues
func (g *PromptGenerator) GeneratePrompt(result *ValidationResult) string {
	if result.IsValid() && !result.HasWarnings() {
		return ""
	}

	var prompt strings.Builder

	prompt.WriteString("# 🚨 Genesis Validation Failed\n\n")
	prompt.WriteString("The Genesis template validator has detected inconsistencies that need to be fixed.\n\n")

	prompt.WriteString("## 📊 Validation Summary\n\n")
	fmt.Fprintf(&prompt, "- **Template files found**: %d\n", len(result.TemplateFiles))
	fmt.Fprintf(&prompt, "- **Orphaned files**: %d\n", len(result.OrphanedFiles))
	fmt.Fprintf(&prompt, "- **Missing files**: %d\n", len(result.MissingFiles))
	fmt.Fprintf(&prompt, "- **Inconsistencies**: %d\n", len(result.Inconsistencies))
	fmt.Fprintf(&prompt, "- **Errors**: %d\n\n", len(result.Errors))

	if len(result.Errors) > 0 {
		prompt.WriteString("## ❌ Critical Errors\n\n")
		for i, err := range result.Errors {
			fmt.Fprintf(&prompt, "%d. %s\n", i+1, err.Error())
		}
		prompt.WriteString("\n")
	}

	if len(result.OrphanedFiles) > 0 {
		prompt.WriteString("## 🔍 Orphaned Template Files\n\n")
		prompt.WriteString("These template files exist but are NOT referenced in START-HERE.md:\n\n")
		for i, file := range result.OrphanedFiles {
			fmt.Fprintf(&prompt, "%d. `%s`\n", i+1, file)
		}
		prompt.WriteString("\n**Action Required**: For each orphaned file, decide:\n")
		prompt.WriteString("- **Option 1**: Add to START-HERE.md Section 3 (if MANDATORY or RECOMMENDED)\n")
		prompt.WriteString("- **Option 2**: Add to START-HERE.md Section 3.7 (if OPTIONAL)\n")
		prompt.WriteString("- **Option 3**: Remove the file (if obsolete)\n\n")
	}

	if len(result.MissingFiles) > 0 {
		prompt.WriteString("## ⚠️ Missing Template Files\n\n")
		prompt.WriteString("These files are referenced in documentation but DO NOT exist:\n\n")
		for i, file := range result.MissingFiles {
			docs := result.ReferencedFiles[file]
			fmt.Fprintf(&prompt, "%d. `%s`\n", i+1, file)
			fmt.Fprintf(&prompt, "   Referenced in: %s\n", strings.Join(docs, ", "))
		}
		prompt.WriteString("\n**Action Required**: For each missing file:\n")
		prompt.WriteString("- **Option 1**: Create the template file\n")
		prompt.WriteString("- **Option 2**: Remove references from documentation (if obsolete)\n\n")
	}

	// Note: Doc consistency check was removed since CHECKLIST.md is a high-level
	// verification document. START-HERE.md is the single source of truth for templates.

	prompt.WriteString("## 🎯 Recommended Actions\n\n")
	prompt.WriteString("1. **Review all orphaned files** - Add to START-HERE.md or remove\n")
	prompt.WriteString("2. **Fix missing files** - Create templates or remove references\n")
	prompt.WriteString("3. **Run validator again** - Verify all issues are resolved\n")
	prompt.WriteString("4. **Update CHANGELOG.md** - Document what was fixed\n\n")

	prompt.WriteString("## 📝 Example Fix\n\n")
	prompt.WriteString("```bash\n")
	prompt.WriteString("# For orphaned file: templates/web-app/new-feature-template.js\n")
	prompt.WriteString("# Add to START-HERE.md Section 3.2:\n")
	prompt.WriteString("cp genesis/templates/web-app/new-feature-template.js js/new-feature.js\n")
	prompt.WriteString("```\n\n")

	prompt.WriteString("---\n\n")
	prompt.WriteString("**Run this command to validate again**:\n")
	prompt.WriteString("```bash\n")
	prompt.WriteString("./genesis-validator/bin/genesis-validator\n")
	prompt.WriteString("```\n")

	return prompt.String()
}
