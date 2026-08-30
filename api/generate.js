const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  var body = req.body;
  if (!body || !body.projectName || !body.language || !body.projectType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  var prompt = buildPrompt(body);

  try {
    var client = new Anthropic({ apiKey: apiKey });
    var response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    });

    var text = response.content[0].text;
    var files = parseFiles(text);

    if (Object.keys(files).length === 0) {
      return res.status(500).json({ error: 'Failed to parse generated files' });
    }

    return res.status(200).json({ files: files });
  } catch (err) {
    console.error('Claude API error:', err.message);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
};

function buildPrompt(body) {
  var conventions = body.conventions || [];
  var conventionList = conventions.join(', ');

  var prompt = 'Generate a complete .claude/ folder setup for a Claude Code project.\n\n';
  prompt += 'Project details:\n';
  prompt += '- Name: ' + body.projectName + '\n';
  prompt += '- Language: ' + body.language + '\n';
  prompt += '- Framework: ' + (body.framework || 'none') + '\n';
  prompt += '- Database: ' + (body.database || 'none') + '\n';
  prompt += '- Type: ' + body.projectType + '\n';
  prompt += '- Team size: ' + (body.teamSize || 'solo') + '\n';
  prompt += '- Conventions to enforce: ' + conventionList + '\n';

  if (body.protectedFiles) {
    prompt += '- Protected files (never restructure): ' + body.protectedFiles + '\n';
  }
  if (body.additionalContext) {
    prompt += '- Additional context: ' + body.additionalContext + '\n';
  }

  prompt += '\nGenerate these files:\n\n';
  prompt += '1. CLAUDE.md - Main project context file. Include:\n';
  prompt += '   - What this project is (one paragraph)\n';
  prompt += '   - Tech stack\n';
  prompt += '   - Key commands (build, test, lint, deploy)\n';
  prompt += '   - File structure overview\n';
  prompt += '   - Coding conventions specific to the language/framework\n';
  prompt += '   - @rules references for any rule files generated\n\n';

  if (conventions.indexOf('plan-before-edit') >= 0) {
    prompt += '2. rules/plan-before-edit.md - Require a plan with Before/After code blocks before any edit. Include:\n';
    prompt += '   - Problem statement\n';
    prompt += '   - Before/After code blocks\n';
    prompt += '   - Why this will work\n';
    prompt += '   - Scope / blast radius\n';
    prompt += '   - Rollback steps\n';
    prompt += '   - Wait for explicit approval before editing\n\n';
  }

  if (conventions.indexOf('protected-files') >= 0 && body.protectedFiles) {
    prompt += '3. rules/protected-files.md - List files that should never be restructured, only minimally edited.\n\n';
  }

  if (conventions.indexOf('naming-conventions') >= 0) {
    prompt += '4. rules/naming-conventions.md - Naming rules for the specific language (' + body.language + '). Variables, functions, files, components.\n\n';
  }

  if (conventions.indexOf('testing') >= 0) {
    prompt += '5. rules/testing.md - Testing requirements. What needs tests, what framework to use, minimum coverage expectations.\n\n';
  }

  if (conventions.indexOf('commit-style') >= 0) {
    prompt += '6. rules/commit-style.md - Commit message format (conventional commits or project-specific).\n\n';
  }

  if (conventions.indexOf('code-review') >= 0) {
    prompt += '7. skills/code-review/SKILL.md - Code review skill with language-specific checklist.\n\n';
  }

  if (conventions.indexOf('security') >= 0) {
    prompt += '8. skills/security-review/SKILL.md - Security review skill for the specific stack.\n\n';
  }

  if (conventions.indexOf('memory-system') >= 0) {
    prompt += '9. memory/MEMORY.md - Memory index file with initial structure.\n';
    prompt += '10. memory/STATUS.md - Project status tracker (Session 1 - initial setup).\n';
    prompt += '11. memory/lessons.md - Empty lessons file with header.\n';
    prompt += '12. memory/decisions.md - Empty decisions file with header.\n\n';
  }

  prompt += 'OUTPUT FORMAT:\n';
  prompt += 'Output each file as:\n';
  prompt += '===FILE: path/filename.md===\n';
  prompt += '(file content)\n';
  prompt += '===END===\n\n';
  prompt += 'Use the exact delimiters above. The path should be relative to .claude/ (e.g. "CLAUDE.md", "rules/plan-before-edit.md", "skills/code-review/SKILL.md", "memory/MEMORY.md").\n';
  prompt += 'Make the content practical and specific to the project - not generic templates. Reference actual file paths, commands, and patterns for ' + body.language + '/' + (body.framework || 'the stack') + '.\n';
  prompt += 'Keep each file concise - CLAUDE.md under 150 lines, rules under 80 lines, skills under 60 lines.\n';

  return prompt;
}

function parseFiles(text) {
  var files = {};
  var pattern = /===FILE:\s*(.+?)===\n([\s\S]*?)===END===/g;
  var match;

  while ((match = pattern.exec(text)) !== null) {
    var fileName = match[1].trim();
    var content = match[2].trim();
    files[fileName] = content;
  }

  return files;
}
