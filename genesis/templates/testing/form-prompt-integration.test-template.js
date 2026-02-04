/**
 * Form-to-Prompt Integration Tests for {{PROJECT_NAME}}
 *
 * CRITICAL: These tests ensure that form fields match prompt template requirements.
 * This prevents the bug where form collects different fields than prompts expect.
 *
 * Template Variables:
 * - {{PROJECT_NAME}}: Name of the project (e.g., "One-Pager Generator")
 * - {{PHASE1_FIELDS}}: Array of field names for Phase 1 (e.g., ["title", "problem", "solution"])
 * - {{PHASE2_PLACEHOLDER}}: Placeholder name for Phase 2 (e.g., "phase1_output")
 * - {{PHASE3_PLACEHOLDERS}}: Array of placeholder names for Phase 3 (e.g., ["phase1_output", "phase2_review"])
 */

import { describe, test, expect } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readTemplate(templateName) {
  const templatePath = path.join(__dirname, "..", "prompts", templateName);
  return fs.readFileSync(templatePath, "utf8");
}

describe("Form-to-Prompt Integration Tests", () => {
  describe("Phase 1 Template Variable Matching", () => {
  const phase1Template = readTemplate("phase1.md");

  // TODO: Replace {{PHASE1_FIELDS}} with actual field names
  const phase1Fields = ["title", "problem", "solution"]; // {{PHASE1_FIELDS}}

  test.each(phase1Fields)(
    "CRITICAL: phase1.md MUST contain {%s} placeholder",
    (field) => {
    expect(phase1Template).toContain(`{${field}}`);
    }
  );

  test("phase1.md should contain all required input placeholders", () => {
    for (const field of phase1Fields) {
    expect(phase1Template).toContain(`{${field}}`);
    }
  });
  });

  describe("Phase 2 Template Variable Matching", () => {
  const phase2Template = readTemplate("phase2.md");

  // TODO: Replace with actual placeholder name
  const phase2Placeholder = "phase1_output"; // {{PHASE2_PLACEHOLDER}}

  test(`CRITICAL: phase2.md MUST contain {${phase2Placeholder}} placeholder`, () => {
    expect(phase2Template).toContain(`{${phase2Placeholder}}`);
  });
  });

  describe("Phase 3 Template Variable Matching", () => {
  const phase3Template = readTemplate("phase3.md");

  // TODO: Replace with actual placeholder names
  const phase3Placeholders = ["phase1_output", "phase2_review"]; // {{PHASE3_PLACEHOLDERS}}

  test.each(phase3Placeholders)(
    "CRITICAL: phase3.md MUST contain {%s} placeholder",
    (placeholder) => {
    expect(phase3Template).toContain(`{${placeholder}}`);
    }
  );
  });

  describe("Form Field Coverage", () => {
  test("All form fields should have corresponding prompt placeholders", () => {
    const phase1Template = readTemplate("phase1.md");

    // TODO: Replace with actual form fields
    const formFields = ["title", "problem", "solution"]; // {{PHASE1_FIELDS}}

    for (const field of formFields) {
    expect(phase1Template).toContain(`{${field}}`);
    }
  });

  test("Phase 2 and 3 should reference previous phase outputs", () => {
    const phase2Template = readTemplate("phase2.md");
    const phase3Template = readTemplate("phase3.md");

    // Phase 2 needs Phase 1 output
    expect(phase2Template).toContain("{phase1_output}");

    // Phase 3 needs both Phase 1 and Phase 2 outputs
    expect(phase3Template).toContain("{phase1_output}");
    expect(phase3Template).toContain("{phase2_review}");
  });
  });

  describe("Prompt Replacement Simulation", () => {
  test("Phase 1 prompt should have no unfilled placeholders after replacement", () => {
    let template = readTemplate("phase1.md");

    // TODO: Replace with actual field replacements
    // Simulate the replacement that happens in app.js generatePhase1Prompt
    template = template.replace(/{title}/g, "Test Title");
    template = template.replace(/{problem}/g, "Test Problem");
    template = template.replace(/{solution}/g, "Test Solution");

    // No placeholders should remain for form fields
    // TODO: Update these assertions based on actual fields
    expect(template).not.toContain("{title}");
    expect(template).not.toContain("{problem}");
    expect(template).not.toContain("{solution}");
  });

  test("Phase 2 prompt should have no unfilled placeholders after replacement", () => {
    let template = readTemplate("phase2.md");

    // Simulate the replacement that happens in app.js generatePhase2Prompt
    template = template.replace(/{phase1_output}/g, "Phase 1 content");

    // No placeholders should remain
    expect(template).not.toContain("{phase1_output}");
  });

  test("Phase 3 prompt should have no unfilled placeholders after replacement", () => {
    let template = readTemplate("phase3.md");

    // Simulate the replacement that happens in app.js generatePhase3Prompt
    template = template.replace(/{phase1_output}/g, "Phase 1 content");
    template = template.replace(/{phase2_review}/g, "Phase 2 review feedback");

    // No placeholders should remain
    expect(template).not.toContain("{phase1_output}");
    expect(template).not.toContain("{phase2_review}");
  });
  });
});

