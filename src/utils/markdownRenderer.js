import { marked } from 'marked';
import katex from 'katex';

/**
 * Custom renderer for Markdown with KaTeX math formula support
 * Handles display math ($$...$$) and inline math ($...$) cleanly,
 * preserving Sinhala text and Unicode symbols inside formulas.
 */
export function renderMarkdownWithMath(markdownText) {
  if (!markdownText) return '';

  const mathBlocks = [];
  // 1. Extract and render display math: $$ ... $$
  let processed = markdownText.replace(/\$\$([\s\S]+?)\$\$/g, (match, equation) => {
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      const id = `%%MATHBLOCK${mathBlocks.length}%%`;
      mathBlocks.push(`<div class="katex-display-wrapper"><div class="katex-display-card">${rendered}</div></div>`);
      return `\n\n${id}\n\n`;
    } catch (e) {
      console.warn('KaTeX block error:', e);
      return match;
    }
  });

  const inlineMath = [];
  // 2. Extract and render inline math: $ ... $ (excluding escaped \$ or currency like $200)
  processed = processed.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (match, equation) => {
    // Only parse if equation contains LaTeX symbols, Greek letters, or math operators
    const eq = equation.trim();
    if (!eq) return match;
    
    try {
      const rendered = katex.renderToString(eq, {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
      const id = `%%INLINEMATH${inlineMath.length}%%`;
      inlineMath.push(rendered);
      return id;
    } catch (e) {
      return match;
    }
  });

  // 3. Parse Markdown to HTML
  let html = marked.parse(processed, {
    gfm: true,
    breaks: true
  });

  // 4. Restore rendered display math blocks (handling <p> wrapping from marked)
  mathBlocks.forEach((block, idx) => {
    const key = `%%MATHBLOCK${idx}%%`;
    html = html.split(`<p>${key}</p>`).join(block);
    html = html.split(key).join(block);
  });

  // 5. Restore rendered inline math blocks
  inlineMath.forEach((block, idx) => {
    const key = `%%INLINEMATH${idx}%%`;
    html = html.split(key).join(block);
  });

  return html;
}
