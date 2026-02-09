/**
 * Prompt generation for LLM-based document scoring
 * This is the GENESIS TEMPLATE - customize for your specific document type
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} documentContent - The document content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(documentContent) {
  return `You are an expert evaluating a structured document.

Score this document using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Problem Clarity (30 points)
- **Problem Statement (10 pts)**: Clear, specific problem definition with dedicated section
- **Cost of Inaction (10 pts)**: Quantified impact of not solving this problem
- **Business Focus (10 pts)**: Problem tied to customer/business value, not just technical

### 2. Solution Quality (25 points)
- **Addresses Problem (10 pts)**: Solution clearly maps to stated problem
- **Measurable Goals (10 pts)**: Goals are specific and measurable, not vague
- **High-Level (5 pts)**: Solution stays at appropriate level, no implementation details

### 3. Scope Discipline (25 points)
- **In-Scope (8 pts)**: Clear definition of what WILL be done
- **Out-of-Scope (9 pts)**: Explicit definition of what WON'T be done
- **SMART Metrics (8 pts)**: Success metrics are Specific, Measurable, Achievable, Relevant, Time-bound

### 4. Completeness (20 points)
- **Required Sections (8 pts)**: Problem, Solution, Goals, Scope, Metrics, Stakeholders, Timeline
- **Stakeholders (6 pts)**: Clear identification of who's involved and their roles
- **Timeline (6 pts)**: Realistic milestones and phased approach

## CALIBRATION GUIDANCE
- Be HARSH. Most documents score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for stakeholder review.
- Deduct points for verbosity - be concise.
- Deduct points for EVERY vague qualifier without metrics.
- Deduct points for weasel words ("should be able to", "might", "could potentially").
- Deduct points for marketing fluff ("best-in-class", "cutting-edge", "world-class").
- Reward explicit scope boundaries (both in AND out).
- Reward quantified metrics and business impact.
- Deduct points for missing required sections.

## DOCUMENT TO EVALUATE

\`\`\`
${documentContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Problem Clarity: [X]/30
[2-3 sentence justification]

### Solution Quality: [X]/25
[2-3 sentence justification]

### Scope Discipline: [X]/25
[2-3 sentence justification]

### Completeness: [X]/20
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} documentContent - The document content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(documentContent, currentResult) {
  const issuesList = [
    ...(currentResult.problemClarity?.issues || []),
    ...(currentResult.solution?.issues || []),
    ...(currentResult.scope?.issues || []),
    ...(currentResult.completeness?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior expert providing detailed feedback on a structured document.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Problem Clarity: ${currentResult.problemClarity?.score || 0}/30
- Solution Quality: ${currentResult.solution?.score || 0}/25
- Scope Discipline: ${currentResult.scope?.score || 0}/25
- Completeness: ${currentResult.completeness?.score || 0}/20

Key issues detected:
${issuesList || '- None detected by automated scan'}

## DOCUMENT TO CRITIQUE

\`\`\`
${documentContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall document quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Revised Document** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Be concise. Make it ready for stakeholder review.`;
}

/**
 * Generate rewrite prompt
 * @param {string} documentContent - The document content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(documentContent, currentResult) {
  return `You are a senior expert rewriting a document to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL DOCUMENT

\`\`\`
${documentContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished document that:
1. Is concise and stakeholder-focused
2. Has all required sections (Problem, Cost of Inaction, Solution, Goals, Scope, Metrics, Stakeholders, Timeline)
3. Includes explicit "In Scope" AND "Out of Scope" definitions
4. Has specific, quantified metrics (numbers, percentages, timeframes)
5. Clearly ties problem to business/customer value
6. Includes measurable goals tied to the problem
7. Defines stakeholders and their roles
8. Provides realistic timeline with phases/milestones
9. Avoids vague qualifiers, weasel words, and marketing fluff
10. Stays high-level (no implementation details)

Output ONLY the rewritten document in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}
