package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/bordenet/genesis/genesis-validator/internal/validator"
)

func main() {
	// Parse command-line flags
	verbose := flag.Bool("verbose", false, "Enable verbose output")
	noPrompt := flag.Bool("no-prompt", false, "Disable LLM prompt generation")
	genesisRoot := flag.String("genesis-root", "genesis", "Path to genesis directory")
	help := flag.Bool("help", false, "Show help message")

	flag.Parse()

	if *help {
		printHelp()
		os.Exit(0)
	}

	// Create configuration
	config := validator.DefaultConfig()
	config.Verbose = *verbose
	config.GeneratePrompt = !*noPrompt
	config.GenesisRoot = *genesisRoot
	config.TemplatesDir = *genesisRoot + "/templates"
	config.StartHereFile = *genesisRoot + "/START-HERE.md"
	config.ChecklistFile = *genesisRoot + "/00-AI-MUST-READ-FIRST.md"

	// Run validation
	v := validator.NewValidator(config)
	result, err := v.Validate()

	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Validation failed: %v\n", err)
		os.Exit(1)
	}

	// Print summary
	fmt.Println(result.Summary())
	fmt.Println()

	// Print detailed results if verbose
	if config.Verbose {
		printDetailedResults(result)
	}

	// Generate LLM prompt if there are issues
	if config.GeneratePrompt && (!result.IsValid() || result.HasWarnings()) {
		promptGen := validator.NewPromptGenerator(config)
		prompt := promptGen.GeneratePrompt(result)

		fmt.Println("=" + string(make([]byte, 79)))
		fmt.Println("LLM PROMPT FOR FIXING ISSUES")
		fmt.Println("=" + string(make([]byte, 79)))
		fmt.Println()
		fmt.Println(prompt)
	}

	// Exit with appropriate code
	if !result.IsValid() {
		os.Exit(1)
	}

	if result.HasWarnings() {
		os.Exit(2) // Warning exit code
	}

	os.Exit(0)
}

func printHelp() {
	fmt.Println("Genesis Validator - Validates Genesis template consistency")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  genesis-validator [options]")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -verbose          Enable verbose output")
	fmt.Println("  -no-prompt        Disable LLM prompt generation")
	fmt.Println("  -genesis-root     Path to genesis directory (default: genesis)")
	fmt.Println("  -help             Show this help message")
	fmt.Println()
	fmt.Println("Exit Codes:")
	fmt.Println("  0 - All checks passed")
	fmt.Println("  1 - Critical errors found (orphaned/missing files)")
	fmt.Println("  2 - Warnings found (inconsistencies)")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  genesis-validator")
	fmt.Println("  genesis-validator -verbose")
	fmt.Println("  genesis-validator -genesis-root /path/to/genesis")
}

func printDetailedResults(result *validator.ValidationResult) {
	if len(result.TemplateFiles) > 0 {
		fmt.Println("📁 Template Files:")
		for _, file := range result.TemplateFiles {
			fmt.Printf("  ✓ %s\n", file)
		}
		fmt.Println()
	}

	if len(result.OrphanedFiles) > 0 {
		fmt.Println("🔍 Orphaned Files:")
		for _, file := range result.OrphanedFiles {
			fmt.Printf("  ⚠️  %s\n", file)
		}
		fmt.Println()
	}

	if len(result.MissingFiles) > 0 {
		fmt.Println("❌ Missing Files:")
		for _, file := range result.MissingFiles {
			docs := result.ReferencedFiles[file]
			fmt.Printf("  ❌ %s (referenced in: %v)\n", file, docs)
		}
		fmt.Println()
	}

	if len(result.Inconsistencies) > 0 {
		fmt.Println("📋 Inconsistencies:")
		for i, inc := range result.Inconsistencies {
			fmt.Printf("  %d. [%s] %s: %s\n", i+1, inc.Type, inc.File, inc.Description)
			if inc.Location != "" {
				fmt.Printf("     Location: %s\n", inc.Location)
			}
		}
		fmt.Println()
	}
}
