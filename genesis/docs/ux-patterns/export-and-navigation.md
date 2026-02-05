# UX Patterns: Export and Navigation

> Part of [Genesis UX Patterns](../UX-PATTERNS.md)

---

## Pattern 9: Export Button for Completed Projects

**Problem**: Completed projects in home view have no way to export without re-opening.

**Solution**: Show Export button on completed projects in the project list.

```javascript
function renderProjectList(projects) {
    return projects.map(p => {
        const isComplete = p.phase > WORKFLOW_CONFIG.phaseCount;
        return `
            <div class="project-card">
                <div class="project-info">
                    <h3>${p.title}</h3>
                    ${isComplete ? `
                        <span class="badge badge-success">✓ Complete</span>
                    ` : `
                        <span>Phase ${p.phase} of ${WORKFLOW_CONFIG.phaseCount}</span>
                    `}
                </div>
                <div class="project-actions">
                    ${isComplete ? `
                        <button onclick="exportProject('${p.id}')" class="btn btn-success">
                            Export
                        </button>
                    ` : ''}
                    <button onclick="deleteProject('${p.id}')" class="btn btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
```

**Testing Checklist**:

- [ ] Completed projects show Export button
- [ ] In-progress projects do NOT show Export button
- [ ] Export button downloads markdown file

---

## Pattern 10: Export Attribution

**Problem**: Exported documents have no attribution, so readers don't know the source.

**Solution**: Add attribution footer to all exported markdown.

```javascript
exportAsMarkdown() {
    const finalOutput = this.getPhaseOutput(3);
    const attribution = '\n\n---\n\n*Generated with [Tool Name](https://url-to-tool/)*';

    if (finalOutput) {
        return finalOutput + attribution;
    }
    // ... fallback logic
}
```

**Testing Checklist**:

- [ ] Exported markdown includes attribution footer
- [ ] Attribution link points to the tool's URL
- [ ] Attribution is styled as italics

---

## Pattern 11: Cross-Site Navigation Links

**Problem**: Each assistant tool is isolated - users don't know about related tools.

**Solution**: Include navigation links to related assistants in header and README.

```html
<!-- In app header -->
<nav class="related-tools">
    <span class="text-gray-400">Related:</span>
    <a href="https://bordenet.github.io/pr-faq-assistant/" target="_blank">PR-FAQ</a>
    <a href="https://bordenet.github.io/one-pager/" target="_blank">One-Pager</a>
    <a href="https://bordenet.github.io/product-requirements-assistant/" target="_blank">PRD</a>
</nav>
```

**Testing Checklist**:

- [ ] Header includes links to related tools
- [ ] Links open in new tabs
- [ ] README has "Related Projects" table

---

## Pattern 12: Landing Page Validator Link

**Problem**: Landing page doesn't link to the validator tool that scores documents.

**Solution**: Empty state should mention the validator and target score.

```html
<p class="text-sm text-gray-400">
    Documents are optimized for
    <a href="https://github.com/bordenet/genesis" target="_blank"
       class="text-blue-500 hover:underline">
        genesis-validator
    </a>
    (70+ score target)
</p>
```

**Testing Checklist**:

- [ ] Empty state mentions validator
- [ ] Link to validator works
- [ ] Target score is displayed

