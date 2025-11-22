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
	prompt.WriteString(fmt.Sprintf("- **Template files found**: %d\n", len(result.TemplateFiles)))
	prompt.WriteString(fmt.Sprintf("- **Orphaned files**: %d\n", len(result.OrphanedFiles)))
	prompt.WriteString(fmt.Sprintf("- **Missing files**: %d\n", len(result.MissingFiles)))
	prompt.WriteString(fmt.Sprintf("- **Inconsistencies**: %d\n", len(result.Inconsistencies)))
	prompt.WriteString(fmt.Sprintf("- **Errors**: %d\n\n", len(result.Errors)))

	if len(result.Errors) > 0 {
		prompt.WriteString("## ❌ Critical Errors\n\n")
		for i, err := range result.Errors {
			prompt.WriteString(fmt.Sprintf("%d. %s\n", i+1, err.Error()))
		}
		prompt.WriteString("\n")
	}

	if len(result.OrphanedFiles) > 0 {
		prompt.WriteString("## 🔍 Orphaned Template Files\n\n")
		prompt.WriteString("These template files exist but are NOT referenced in START-HERE.md or AI-EXECUTION-CHECKLIST.md:\n\n")
		for i, file := range result.OrphanedFiles {
			prompt.WriteString(fmt.Sprintf("%d. `%s`\n", i+1, file))
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
			prompt.WriteString(fmt.Sprintf("%d. `%s`\n", i+1, file))
			prompt.WriteString(fmt.Sprintf("   Referenced in: %s\n", strings.Join(docs, ", ")))
		}
		prompt.WriteString("\n**Action Required**: For each missing file:\n")
		prompt.WriteString("- **Option 1**: Create the template file\n")
		prompt.WriteString("- **Option 2**: Remove references from documentation (if obsolete)\n\n")
	}

	if len(result.Inconsistencies) > 0 {
		prompt.WriteString("## 📋 Documentation Inconsistencies\n\n")
		
		// Group by type
		byType := make(map[string][]Inconsistency)
		for _, inc := range result.Inconsistencies {
			byType[inc.Type] = append(byType[inc.Type], inc)
		}

		if docMismatches, ok := byType["doc_mismatch"]; ok && len(docMismatches) > 0 {
			prompt.WriteString("### START-HERE.md ↔ AI-EXECUTION-CHECKLIST.md Mismatches\n\n")
			for i, inc := range docMismatches {
				prompt.WriteString(fmt.Sprintf("%d. `%s`\n", i+1, inc.File))
				prompt.WriteString(fmt.Sprintf("   %s\n", inc.Description))
			}
			prompt.WriteString("\n**Action Required**: Ensure both files reference the same templates.\n\n")
		}
	}

	prompt.WriteString("## 🎯 Recommended Actions\n\n")
	prompt.WriteString("1. **Review all orphaned files** - Add to documentation or remove\n")
	prompt.WriteString("2. **Fix missing files** - Create templates or remove references\n")
	prompt.WriteString("3. **Sync documentation** - Ensure START-HERE.md and AI-EXECUTION-CHECKLIST.md match\n")
	prompt.WriteString("4. **Run validator again** - Verify all issues are resolved\n")
	prompt.WriteString("5. **Update CHANGELOG.md** - Document what was fixed\n\n")

	prompt.WriteString("## 📝 Example Fix\n\n")
	prompt.WriteString("```bash\n")
	prompt.WriteString("# For orphaned file: templates/web-app/new-feature-template.js\n")
	prompt.WriteString("# Add to START-HERE.md Section 3.2:\n")
	prompt.WriteString("cp genesis/templates/web-app/new-feature-template.js js/new-feature.js\n\n")
	prompt.WriteString("# Add to AI-EXECUTION-CHECKLIST.md Section 3.2:\n")
	prompt.WriteString("- [ ] Copied `js/new-feature.js` from `templates/web-app/new-feature-template.js`\n")
	prompt.WriteString("```\n\n")

	prompt.WriteString("---\n\n")
	prompt.WriteString("**Run this command to validate again**:\n")
	prompt.WriteString("```bash\n")
	prompt.WriteString("./genesis-validator/bin/genesis-validator\n")
	prompt.WriteString("```\n")

	return prompt.String()
}

