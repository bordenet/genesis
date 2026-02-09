package validator

import (
	"bufio"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// BrokenLink represents a broken markdown link
type BrokenLink struct {
	SourceFile string // The markdown file containing the link
	Line       int    // Line number where the link appears
	LinkText   string // The display text of the link
	LinkURL    string // The URL/path that is broken
	Reason     string // Why it's broken (file not found, etc.)
}

// LinkValidator validates markdown links in the repository
type LinkValidator struct {
	config *Config
}

// NewLinkValidator creates a new LinkValidator
func NewLinkValidator(config *Config) *LinkValidator {
	return &LinkValidator{config: config}
}

// ValidateAllLinks scans all markdown files and validates internal links
func (lv *LinkValidator) ValidateAllLinks() ([]BrokenLink, error) {
	var brokenLinks []BrokenLink

	// Find all markdown files
	mdFiles, err := lv.findMarkdownFiles()
	if err != nil {
		return nil, err
	}

	for _, mdFile := range mdFiles {
		links, err := lv.extractLinks(mdFile)
		if err != nil {
			continue // Skip files we can't read
		}

		for _, link := range links {
			if broken := lv.validateLink(mdFile, link); broken != nil {
				brokenLinks = append(brokenLinks, *broken)
			}
		}
	}

	return brokenLinks, nil
}

// findMarkdownFiles finds all .md files in the repository
func (lv *LinkValidator) findMarkdownFiles() ([]string, error) {
	var files []string

	err := filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip errors
		}

		// Skip node_modules, .git, and other common excludes
		if info.IsDir() {
			name := info.Name()
			if name == "node_modules" || name == ".git" || name == "_archive" || name == "coverage" {
				return filepath.SkipDir
			}
			return nil
		}

		if strings.HasSuffix(path, ".md") {
			files = append(files, path)
		}
		return nil
	})

	return files, err
}

// linkInfo holds extracted link information
type linkInfo struct {
	text string
	url  string
	line int
}

// extractLinks extracts all markdown links from a file
func (lv *LinkValidator) extractLinks(filePath string) ([]linkInfo, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer func() { _ = file.Close() }()

	var links []linkInfo
	scanner := bufio.NewScanner(file)
	lineNum := 0
	inCodeBlock := false

	// Pattern for markdown links: [text](url)
	linkPattern := regexp.MustCompile(`\[([^\]]*)\]\(([^)]+)\)`)
	// Pattern for fenced code block start/end (``` or ~~~)
	codeBlockPattern := regexp.MustCompile("^\\s*(`{3,}|~{3,})")
	// Pattern to strip inline code before extracting links
	inlineCodePattern := regexp.MustCompile("`[^`]+`")

	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		// Track code block state
		if codeBlockPattern.MatchString(line) {
			inCodeBlock = !inCodeBlock
			continue
		}

		// Skip links inside code blocks
		if inCodeBlock {
			continue
		}

		// Strip inline code before extracting links to avoid false positives
		lineWithoutInlineCode := inlineCodePattern.ReplaceAllString(line, "")

		matches := linkPattern.FindAllStringSubmatch(lineWithoutInlineCode, -1)
		for _, match := range matches {
			if len(match) >= 3 {
				links = append(links, linkInfo{
					text: match[1],
					url:  match[2],
					line: lineNum,
				})
			}
		}
	}

	return links, scanner.Err()
}

// validateLink checks if a link is valid, returns BrokenLink if broken
func (lv *LinkValidator) validateLink(sourceFile string, link linkInfo) *BrokenLink {
	url := link.url

	// Skip external URLs (we only validate internal links)
	if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
		// Check GitHub URLs pointing to this repo
		if strings.Contains(url, "github.com/bordenet/genesis/blob/main/") ||
			strings.Contains(url, "github.com/bordenet/genesis/tree/main/") {
			return lv.validateGitHubLink(sourceFile, link)
		}
		return nil // Skip other external URLs
	}

	// Skip mailto, anchor-only, and javascript links
	if strings.HasPrefix(url, "mailto:") || strings.HasPrefix(url, "#") || strings.HasPrefix(url, "javascript:") {
		return nil
	}

	// Validate relative path
	return lv.validateRelativePath(sourceFile, link)
}

// validateGitHubLink validates a GitHub URL pointing to this repo
func (lv *LinkValidator) validateGitHubLink(sourceFile string, link linkInfo) *BrokenLink {
	url := link.url

	// Extract the path from GitHub URL
	var localPath string
	if strings.Contains(url, "/blob/main/") {
		parts := strings.SplitN(url, "/blob/main/", 2)
		if len(parts) == 2 {
			localPath = parts[1]
		}
	} else if strings.Contains(url, "/tree/main/") {
		parts := strings.SplitN(url, "/tree/main/", 2)
		if len(parts) == 2 {
			localPath = parts[1]
		}
	}

	if localPath == "" {
		return nil
	}

	// Remove anchor from path
	if idx := strings.Index(localPath, "#"); idx != -1 {
		localPath = localPath[:idx]
	}

	// Remove trailing characters that might have been captured
	localPath = strings.TrimRight(localPath, `">`)

	// Check if file/directory exists
	if _, err := os.Stat(localPath); os.IsNotExist(err) {
		return &BrokenLink{
			SourceFile: sourceFile,
			Line:       link.line,
			LinkText:   link.text,
			LinkURL:    url,
			Reason:     "GitHub URL points to non-existent path: " + localPath,
		}
	}

	return nil
}

// validateRelativePath validates a relative file path
func (lv *LinkValidator) validateRelativePath(sourceFile string, link linkInfo) *BrokenLink {
	url := link.url

	// Remove anchor from path
	if idx := strings.Index(url, "#"); idx != -1 {
		url = url[:idx]
	}

	// Skip empty paths (anchor-only after stripping)
	if url == "" {
		return nil
	}

	// Get the directory of the source file
	sourceDir := filepath.Dir(sourceFile)

	// Resolve the relative path
	targetPath := filepath.Join(sourceDir, url)

	// Also try from repo root
	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		// Try from repo root
		if _, err := os.Stat(url); os.IsNotExist(err) {
			return &BrokenLink{
				SourceFile: sourceFile,
				Line:       link.line,
				LinkText:   link.text,
				LinkURL:    link.url,
				Reason:     "Relative path not found: " + url,
			}
		}
	}

	return nil
}
