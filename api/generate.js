// Template-based generator — no AI API needed, instant results
// Generates a full Clankbrain setup: CLAUDE.md, rules, skills, memory, workflows

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body;
  if (!body || !body.projectName || !body.language || !body.projectType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    var files = generateFiles(body);
    return res.status(200).json({ files: files });
  } catch (err) {
    console.error('Generation error:', err.message);
    return res.status(500).json({ error: 'Generation failed: ' + err.message });
  }
};

// --- Language Data ---

var LANG = {
  javascript: {
    name: 'JavaScript', ext: '.js', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'kebab-case or camelCase',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'eslint', format: 'prettier', test: 'jest',
    testCmd: 'npm test', buildCmd: 'npm run build', devCmd: 'npm run dev',
    installCmd: 'npm install', lockFile: 'package-lock.json', envFile: '.env',
    conventions: [
      'Use `const` for values that do not change, `let` for values that do. Never `var`.',
      'Prefer arrow functions for callbacks.',
      'Use template literals for string interpolation.',
      'Use async/await over .then() chains.',
      'Destructure objects and arrays when accessing multiple properties.',
      'Use optional chaining (?.) and nullish coalescing (??) for safe access.',
      'Export named exports over default exports.',
      'Handle errors with try/catch in async functions.'
    ],
    securityChecks: [
      'No eval(), new Function(), or innerHTML with user input',
      'Sanitize all user input before rendering or database queries',
      'Use parameterized queries for SQL',
      'Validate file uploads (type, size, extension)',
      'Never commit .env or API keys',
      'Use helmet for HTTP security headers (Express)',
      'Set CORS to specific origins in production'
    ],
    reviewChecks: [
      'No console.log left in production code',
      'All promises have error handling',
      'No floating promises (missing await)',
      'Event listeners cleaned up in component unmount',
      'No memory leaks from closures or timers',
      'Array methods used correctly (map returns, forEach does not)',
      'Strict equality (===) used, not loose (==)'
    ]
  },
  python: {
    name: 'Python', ext: '.py', comment: '#',
    varStyle: 'snake_case', fnStyle: 'snake_case', fileStyle: 'snake_case',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'ruff or flake8', format: 'black', test: 'pytest',
    testCmd: 'pytest', buildCmd: 'python -m build', devCmd: 'python manage.py runserver',
    installCmd: 'pip install -r requirements.txt', lockFile: 'requirements.txt', envFile: '.env',
    conventions: [
      'Follow PEP 8 style guide.',
      'Use type hints for function parameters and return values.',
      'Use f-strings for string formatting.',
      'Use pathlib.Path over os.path.',
      'Use dataclasses or Pydantic for structured data.',
      'Use context managers (with) for resources.',
      'Prefer comprehensions over map/filter for simple transforms.',
      'Use logging module over print().'
    ],
    securityChecks: [
      'Use parameterized queries, never f-string for SQL',
      'Validate all user input',
      'Use secrets module for tokens, not random',
      'Never pickle untrusted data',
      'Pin dependency versions',
      'Set DEBUG=False in production',
      'Use CSRF protection on forms'
    ],
    reviewChecks: [
      'No bare except clauses — always specify exception type',
      'No mutable default arguments (def f(x=[]))',
      'Context managers used for file/db operations',
      'Type hints on all public functions',
      'No circular imports',
      'f-strings used consistently (not % or .format)',
      'Docstrings on public classes and functions'
    ]
  },
  java: {
    name: 'Java', ext: '.java', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'checkstyle', format: 'google-java-format', test: 'JUnit 5',
    testCmd: 'mvn test', buildCmd: 'mvn package', devCmd: 'mvn spring-boot:run',
    installCmd: 'mvn install', lockFile: 'pom.xml', envFile: 'application.properties',
    conventions: [
      'One class per file, filename matches class name.',
      'Use meaningful names — no single-letter variables except loop counters.',
      'Prefer composition over inheritance.',
      'Use Optional<T> instead of returning null.',
      'Use final for variables that should not change.',
      'Use try-with-resources for AutoCloseable.',
      'Keep methods under 30 lines.',
      'Use @Override on all overridden methods.'
    ],
    securityChecks: [
      'Use PreparedStatement, never string concat for SQL',
      'Validate input at controller boundaries',
      'Use BCrypt or Argon2 for passwords',
      'Sanitize HTML output',
      'Configure CORS explicitly',
      'Use HTTPS, redirect HTTP',
      'Never log passwords, tokens, or PII'
    ],
    reviewChecks: [
      'No raw types — always parameterize generics',
      'Resources closed in finally or try-with-resources',
      'Null checks on all external data',
      'Immutable objects where possible',
      'No public fields — use getters',
      'Exception messages are descriptive',
      'Thread safety considered for shared state'
    ]
  },
  go: {
    name: 'Go', ext: '.go', comment: '//',
    varStyle: 'camelCase/PascalCase', fnStyle: 'camelCase/PascalCase', fileStyle: 'snake_case',
    classStyle: 'PascalCase', constStyle: 'PascalCase',
    lint: 'golangci-lint', format: 'gofmt', test: 'go test',
    testCmd: 'go test ./...', buildCmd: 'go build', devCmd: 'go run .',
    installCmd: 'go mod download', lockFile: 'go.sum', envFile: '.env',
    conventions: ['Accept interfaces, return structs.', 'Handle errors explicitly.', 'Short names in small scopes, descriptive in larger.', 'One function, one job.', 'Table-driven tests.', 'Group imports: stdlib, external, internal.', 'Use context.Context for cancellation.', 'Channels over shared memory for concurrency.'],
    securityChecks: ['Parameterized queries with database/sql', 'Validate input at handlers', 'crypto/rand not math/rand', 'Timeouts on HTTP clients/servers', 'html/template over text/template', 'Pin module versions', 'Never log secrets'],
    reviewChecks: ['All errors checked — no _ for error returns', 'defer used for cleanup', 'No goroutine leaks', 'Mutex used for shared state', 'Context passed through call chain', 'Exported types documented', 'Race detector clean (go test -race)']
  },
  rust: {
    name: 'Rust', ext: '.rs', comment: '//',
    varStyle: 'snake_case', fnStyle: 'snake_case', fileStyle: 'snake_case',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'clippy', format: 'rustfmt', test: 'cargo test',
    testCmd: 'cargo test', buildCmd: 'cargo build --release', devCmd: 'cargo run',
    installCmd: 'cargo build', lockFile: 'Cargo.lock', envFile: '.env',
    conventions: ['Use Result<T, E> for fallible ops.', 'Prefer &str over String for params.', 'Derive macros generously.', 'Minimize unsafe.', 'Use iterators over manual loops.', 'Make invalid states unrepresentable.', 'Doc comments on public items.', 'thiserror for libs, anyhow for apps.'],
    securityChecks: ['Minimize unsafe blocks', 'Parameterized queries', 'Validate input', 'Pin dependencies', 'Constant-time comparison for secrets', 'Handle integer overflow', 'Never log secrets'],
    reviewChecks: ['No unwrap() in library code', 'Clippy warnings resolved', 'No unnecessary clones', 'Lifetimes explicit where needed', 'Error types implement std::error::Error', 'Unsafe blocks documented with safety comment', 'Tests cover error paths']
  },
  csharp: {
    name: 'C#', ext: '.cs', comment: '//',
    varStyle: 'camelCase/_camelCase', fnStyle: 'PascalCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'PascalCase',
    lint: 'dotnet format', format: 'dotnet format', test: 'xUnit',
    testCmd: 'dotnet test', buildCmd: 'dotnet build', devCmd: 'dotnet run',
    installCmd: 'dotnet restore', lockFile: '*.csproj', envFile: 'appsettings.json',
    conventions: ['PascalCase public, _camelCase private.', 'var for obvious types.', 'LINQ over manual loops.', 'async/await for I/O.', 'Nullable reference types enabled.', 'Records for immutable data.', 'ILogger<T> for logging.', 'Dependency injection everywhere.'],
    securityChecks: ['Parameterized queries with EF Core', 'Data Annotations or FluentValidation', 'ASP.NET Identity for auth', 'HTTPS + HSTS', 'Anti-forgery tokens', 'User Secrets for dev secrets', 'Sanitize output'],
    reviewChecks: ['Async methods return Task', 'IDisposable implemented correctly', 'Null checks with pattern matching', 'No string concatenation in loops', 'ConfigureAwait(false) in libraries', 'Record types for DTOs', 'No magic strings']
  },
  ruby: {
    name: 'Ruby', ext: '.rb', comment: '#',
    varStyle: 'snake_case', fnStyle: 'snake_case', fileStyle: 'snake_case',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'rubocop', format: 'rubocop', test: 'RSpec',
    testCmd: 'bundle exec rspec', buildCmd: 'rake build', devCmd: 'rails server',
    installCmd: 'bundle install', lockFile: 'Gemfile.lock', envFile: '.env',
    conventions: ['Follow Ruby Style Guide.', 'frozen_string_literal comment.', 'Symbols for hash keys.', 'Guard clauses for early returns.', 'Methods under 15 lines.', 'Meaningful names.', 'each/map/select over for.', 'Bundler for deps.'],
    securityChecks: ['Parameterized queries', 'Strong parameters', 'CSRF protection', 'No raw HTML rendering', 'Pin gem versions', 'Rails credentials', 'Validate uploads'],
    reviewChecks: ['No rescue without exception type', 'Frozen string literals', 'No N+1 queries', 'Scopes over class methods for queries', 'Service objects for business logic', 'No callbacks for complex logic', 'Rubocop clean']
  },
  php: {
    name: 'PHP', ext: '.php', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'phpstan', format: 'php-cs-fixer', test: 'PHPUnit',
    testCmd: 'vendor/bin/phpunit', buildCmd: 'composer build', devCmd: 'php artisan serve',
    installCmd: 'composer install', lockFile: 'composer.lock', envFile: '.env',
    conventions: ['PSR-12 standard.', 'Type declarations everywhere.', 'Null coalescing over isset().', 'Named arguments for clarity.', 'Enums over class constants.', 'Thin controllers.', 'Constructor injection.', 'match() over switch().'],
    securityChecks: ['Prepared statements with PDO', 'Validate input', 'password_hash/verify', 'CSRF protection', 'No eval() or include with user input', 'display_errors=Off in prod', 'HTTPS + secure cookies'],
    reviewChecks: ['Strict types declared', 'No mixed return types', 'Dependency injection used', 'No static methods for testable code', 'Query builder over raw SQL', 'Middleware for cross-cutting concerns', 'PHPStan at level 6+']
  },
  swift: {
    name: 'Swift', ext: '.swift', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'camelCase',
    lint: 'swiftlint', format: 'swift-format', test: 'XCTest',
    testCmd: 'swift test', buildCmd: 'swift build', devCmd: 'swift run',
    installCmd: 'swift package resolve', lockFile: 'Package.resolved', envFile: '.env',
    conventions: ['let over var.', 'guard for early exits.', 'Structs over classes.', 'Protocols for abstraction.', 'No abbreviations.', 'if let or guard let for optionals.', 'Result type for errors.', 'Swift API Design Guidelines.'],
    securityChecks: ['Keychain for secrets', 'Validate server certs', 'App Transport Security', 'Sanitize input', 'Parameterized Core Data queries', 'No hardcoded keys', 'Data protection on files'],
    reviewChecks: ['No force unwraps (!)', 'Codable for serialization', 'Combine/async-await for async', 'Access control (private/internal/public)', 'Protocol conformance tested', 'No retain cycles (weak/unowned)', 'SwiftLint clean']
  },
  kotlin: {
    name: 'Kotlin', ext: '.kt', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'ktlint', format: 'ktlint', test: 'JUnit 5',
    testCmd: './gradlew test', buildCmd: './gradlew build', devCmd: './gradlew bootRun',
    installCmd: './gradlew build', lockFile: 'gradle.lockfile', envFile: 'application.yml',
    conventions: ['val over var.', 'Data classes for DTOs.', 'Sealed classes for hierarchies.', 'Extension functions over utils.', 'Scope functions appropriately.', 'Coroutines for async.', 'Null safety — avoid !!.', 'Expression bodies when clear.'],
    securityChecks: ['Parameterized queries', 'Validate at controllers', 'BCrypt for passwords', 'CORS explicit', 'Spring Security', 'Never log secrets', 'Pin versions'],
    reviewChecks: ['No !! operator', 'Coroutine scope managed', 'Data classes for value objects', 'Sealed classes for state', 'No Java-style getters/setters', 'Extension functions not overused', 'Detekt clean']
  },
  other: {
    name: 'Custom', ext: '', comment: '#',
    varStyle: 'project-specific', fnStyle: 'project-specific', fileStyle: 'project-specific',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'project-specific', format: 'project-specific', test: 'project-specific',
    testCmd: '# test command', buildCmd: '# build command', devCmd: '# dev command',
    installCmd: '# install', lockFile: '', envFile: '.env',
    conventions: ['Define naming conventions.', 'Small focused functions.', 'Meaningful names.', 'Handle errors explicitly.', 'Test critical paths.', 'Document public APIs.', 'Review before merge.', 'Update dependencies.'],
    securityChecks: ['Validate input', 'Parameterized queries', 'No hardcoded secrets', 'HTTPS everywhere', 'Sanitize output', 'Review dependencies', 'Least privilege'],
    reviewChecks: ['Error handling complete', 'No dead code', 'No hardcoded values', 'Tests cover happy + error paths', 'Documentation current', 'No duplicated logic', 'Performance considered']
  }
};

var FRAMEWORKS = {
  'next.js': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['next.config.js', 'middleware.ts'], structure: 'app/ or pages/, components/, lib/, public/' },
  'react': { devCmd: 'npm start', buildCmd: 'npm run build', protectedFiles: ['vite.config.ts'], structure: 'src/components/, src/hooks/, src/pages/, src/utils/' },
  'express': { devCmd: 'node server.js', buildCmd: 'npm run build', protectedFiles: ['server.js'], structure: 'routes/, controllers/, middleware/, models/' },
  'django': { devCmd: 'python manage.py runserver', buildCmd: 'collectstatic', protectedFiles: ['manage.py', 'settings.py', 'urls.py'], structure: 'apps/, templates/, static/' },
  'flask': { devCmd: 'flask run', buildCmd: 'pip install -e .', protectedFiles: ['app.py', 'config.py'], structure: 'app/, templates/, static/, models/' },
  'fastapi': { devCmd: 'uvicorn main:app --reload', buildCmd: 'pip install -e .', protectedFiles: ['main.py'], structure: 'app/routers/, app/models/, app/schemas/' },
  'spring boot': { devCmd: 'mvn spring-boot:run', buildCmd: 'mvn package', protectedFiles: ['pom.xml', 'application.properties'], structure: 'src/main/java/.../controllers,services,repositories/' },
  'rails': { devCmd: 'rails server', buildCmd: 'rake assets:precompile', protectedFiles: ['config/routes.rb', 'db/schema.rb'], structure: 'app/models,views,controllers/, config/, db/' },
  'laravel': { devCmd: 'php artisan serve', buildCmd: 'composer install --optimize-autoloader', protectedFiles: ['routes/web.php', 'routes/api.php'], structure: 'app/Models,Http/Controllers/, resources/, routes/' },
  'vue': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['vite.config.ts'], structure: 'src/components/, src/views/, src/stores/' },
  'angular': { devCmd: 'ng serve', buildCmd: 'ng build', protectedFiles: ['angular.json'], structure: 'src/app/components,services,guards/' },
  'svelte': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['svelte.config.js'], structure: 'src/routes/, src/lib/, src/components/' },
  'nuxt': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['nuxt.config.ts'], structure: 'pages/, components/, composables/, server/' }
};

var PROJECT_TYPES = {
  'web-app': 'A web application with a user interface.',
  'api': 'A backend API service.',
  'cli': 'A command-line tool.',
  'mobile': 'A mobile application.',
  'library': 'A reusable library or package.',
  'monorepo': 'A monorepo containing multiple packages or services.',
  'fullstack': 'A full-stack application with frontend and backend.'
};

// --- File Generators ---

function generateFiles(body) {
  var lang = LANG[body.language] || LANG.other;
  var fw = body.framework ? FRAMEWORKS[body.framework.toLowerCase()] : null;
  var conventions = body.conventions || [];
  var files = {};

  files['CLAUDE.md'] = generateClaudeMd(body, lang, fw, conventions);

  for (var i = 0; i < conventions.length; i++) {
    var c = conventions[i];
    if (c === 'plan-before-edit') { files['rules/plan-before-edit.md'] = generatePlanBeforeEdit(body, lang); }
    if (c === 'protected-files') { files['rules/protected-files.md'] = generateProtectedFiles(body, lang, fw); }
    if (c === 'naming-conventions') { files['rules/naming-conventions.md'] = generateNamingConventions(body, lang); }
    if (c === 'testing') { files['rules/testing.md'] = generateTesting(body, lang); }
    if (c === 'commit-style') { files['rules/commit-style.md'] = generateCommitStyle(body); }
    if (c === 'code-review') { files['skills/code-review/SKILL.md'] = generateCodeReviewSkill(body, lang); }
    if (c === 'security') { files['skills/security-review/SKILL.md'] = generateSecuritySkill(body, lang); }
    if (c === 'memory-system') {
      files['memory/MEMORY.md'] = generateMemoryIndex(body);
      files['memory/STATUS.md'] = generateStatus(body, lang);
      files['memory/lessons.md'] = generateLessonsFile();
      files['memory/decisions.md'] = generateDecisionsFile();
      files['memory/tasks/regret.md'] = generateRegretFile();
      files['memory/tasks/skill_scores.md'] = generateSkillScoresFile();
      files['memory/tasks/skill_usage.md'] = generateSkillUsageFile();
      files['memory/tasks/velocity.md'] = generateVelocityFile();
      files['memory/tasks/draft-lessons.md'] = '# Draft Lessons (auto-tracked edits)\n_Run /learn to extract patterns from these._\n';
    }
  }

  // Always generate these core skills
  files['skills/learn/SKILL.md'] = generateLearnSkill();
  files['skills/start-session/SKILL.md'] = generateStartSessionSkill(body);
  files['skills/end-session/SKILL.md'] = generateEndSessionSkill(body);
  files['rules/karpathy-principles.md'] = generateKarpathyPrinciples();

  return files;
}

// --- CLAUDE.md ---

function generateClaudeMd(body, lang, fw, conventions) {
  var s = '';
  s += '# ' + body.projectName + '\n\n';
  s += '## What This Project Is\n';
  s += (PROJECT_TYPES[body.projectType] || 'A software project.') + '\n\n';

  s += '## Tech Stack\n';
  s += '- **Language:** ' + lang.name + '\n';
  if (body.framework) { s += '- **Framework:** ' + body.framework + '\n'; }
  if (body.database) { s += '- **Database:** ' + body.database + '\n'; }
  s += '- **Testing:** ' + lang.test + '\n';
  s += '- **Linting:** ' + lang.lint + '\n';
  s += '- **Formatting:** ' + lang.format + '\n\n';

  s += '## Commands\n```\n';
  s += 'Install:  ' + (fw ? lang.installCmd : lang.installCmd) + '\n';
  s += 'Dev:      ' + (fw ? fw.devCmd : lang.devCmd) + '\n';
  s += 'Build:    ' + (fw ? fw.buildCmd : lang.buildCmd) + '\n';
  s += 'Test:     ' + lang.testCmd + '\n';
  s += 'Lint:     ' + lang.lint + ' .\n';
  s += '```\n\n';

  if (fw && fw.structure) {
    s += '## File Structure\n```\n' + fw.structure + '\n```\n\n';
  }

  s += '## Coding Conventions\n';
  for (var i = 0; i < lang.conventions.length; i++) { s += '- ' + lang.conventions[i] + '\n'; }
  s += '\n';

  // Model Selection
  s += '## Model Selection\n';
  s += '**Default: Sonnet.** Use Sonnet for routine work.\n\n';
  s += '**Switch to Opus ONLY when:**\n';
  s += '1. Multi-file cross-cutting (3+ files with dependencies)\n';
  s += '2. Unknown root cause (competing hypotheses)\n';
  s += '3. Architecture decision (new feature design, approach tradeoffs)\n\n';
  s += '**After the hard part is done, drop back to Sonnet.**\n\n';

  // Session Commands
  s += '## Commands\n\n';
  s += '### `Start Session`\n';
  s += 'Read `memory/STATUS.md` and report: "Ready. Last change: [summary]. What are we working on?"\n\n';
  s += '### `End Session`\n';
  s += '1. Run `/learn` - extract patterns from this session\n';
  s += '2. Update `memory/STATUS.md` - increment session, one-line summary\n';
  s += '3. Update `memory/MEMORY.md` currentDate\n';
  s += '4. Commit all changes\n';
  s += '5. Report: "Session complete."\n\n';

  // Middle Path
  s += '## Scoped Pushback\n\n';
  s += 'Claude operates as executor by default. Three bounded permissions:\n\n';
  s += '### 1. Pre-Plan Challenge\n';
  s += 'If the proposed approach contradicts a settled decision in `decisions.md` or a regret entry in `tasks/regret.md`, surface it before the plan.\n\n';
  s += '### 2. Start Session Observation\n';
  s += 'After reporting last change, add one line maximum:\n';
  s += '> Noticed: [one concrete observation about recent changes worth attention]\n\n';
  s += '### 3. Architecture Flag\n';
  s += 'If a proposed feature would create a duplicate pattern where 2+ already exist, flag it.\n\n';

  if (body.additionalContext) {
    s += '## Additional Context\n' + body.additionalContext + '\n\n';
  }

  // Rule references
  s += '---\n\n';
  s += '@rules/plan-before-edit.md\n';
  s += '@rules/karpathy-principles.md\n';
  if (conventions.indexOf('protected-files') >= 0) { s += '@rules/protected-files.md\n'; }
  if (conventions.indexOf('naming-conventions') >= 0) { s += '@rules/naming-conventions.md\n'; }
  if (conventions.indexOf('testing') >= 0) { s += '@rules/testing.md\n'; }
  if (conventions.indexOf('commit-style') >= 0) { s += '@rules/commit-style.md\n'; }

  return s;
}

// --- Plan Before Edit (full 8-section version) ---

function generatePlanBeforeEdit(body, lang) {
  var s = '';
  s += '# Plan Before Edit - Required for All Code Changes\n\n';
  s += '**HARD RULE - NO EXCEPTIONS:**\n';
  s += 'Before making ANY edit to ANY code file, present the full plan and wait for explicit approval.\n\n';
  s += '**Does NOT apply to:** memory files, .claude/ config files.\n\n';
  s += '---\n\n';

  s += '## Step 0 - Regret Check (silent)\n\n';
  s += 'Before showing any plan, grep `tasks/regret.md` for keywords matching the proposed approach.\n';
  s += '- No match: proceed silently.\n';
  s += '- Match found: surface it before the plan.\n\n';

  s += '## Step 1 - Validate Before Showing\n\n';
  s += 'Verify every function reference with Grep or Read. Never show a plan with unverified references.\n\n';

  s += '## Required Plan Format\n\n';
  s += '### Problem / Feature\nOne clear sentence.\n\n';
  s += '### All Related Functions\nList every function touched with file path and line number.\n\n';
  s += '### Before (relevant lines only)\n```' + body.language + '\n// current code\n```\n\n';
  s += '### After\n```' + body.language + '\n// replacement code\n```\n\n';
  s += '### Why this will work\nOne sentence explaining the mechanism.\n\n';
  s += '### Scope / Blast Radius\n';
  s += '- **Files touched:** every file that will change\n';
  s += '- **Lines changed:** exact count\n';
  s += '- **Type:** Logic change | Refactor | Config/data only\n';
  s += '- **Affected at runtime:** what breaks if this goes wrong\n\n';
  s += '### Evaluation\n';
  s += '- **Risks:** concrete risks with mitigations\n';
  s += '- **Confidence:** High | Medium | Low\n';
  s += '- **Verdict:** Proceed | Hold | Redesign\n\n';
  s += '### Challenge (devil\'s advocate)\n';
  s += 'The strongest argument AGAINST this approach.\n\n';
  s += '### Rollback\n```\ngit restore path/to/file\n```\n\n';

  s += '---\n\n';
  s += '## Step 2 - Wait for Approval\n\n';
  s += 'Show the plan. Wait for "yes" / "go" / "do it". Only then edit.\n\n';
  s += '**Approval must be the user\'s NEXT message.** If their reply contains corrections, re-show the updated plan and wait again.\n\n';
  s += '**Show the full plan after every adjustment** - never delta-only.\n\n';

  s += '## Step 3 - Verify After Every Edit\n\n';
  s += '1. Read back the changed lines\n';
  s += '2. Show the user the actual lines (quote, don\'t summarize)\n';
  s += '3. Confirm: "Verified [file]:[lines]"\n\n';

  s += '## Step 4 - Confirm Actual Scope\n\n';
  s += '```\ngit diff --stat\n```\nReport actual lines changed vs plan.\n';

  return s;
}

// --- Karpathy Principles ---

function generateKarpathyPrinciples() {
  var s = '';
  s += '# Coding Principles\n\n';
  s += '## 1. Think Before Coding\n';
  s += '- State assumptions explicitly. If uncertain, ask.\n';
  s += '- If multiple interpretations exist, present them.\n';
  s += '- If a simpler approach exists, say so.\n\n';
  s += '## 2. Simplicity First\n';
  s += 'Minimum code that solves the problem. Nothing speculative.\n';
  s += '- No features beyond what was asked.\n';
  s += '- No abstractions for single-use code.\n';
  s += '- No error handling for impossible scenarios.\n';
  s += '- If 200 lines could be 50, rewrite it.\n\n';
  s += '## 3. Surgical Changes\n';
  s += 'Touch only what you must. Clean up only your own mess.\n';
  s += '- Don\'t "improve" adjacent code.\n';
  s += '- Match existing style.\n';
  s += '- Remove only what YOUR changes made unused.\n\n';
  s += '## 4. Goal-Driven Execution\n';
  s += 'Define success criteria. Loop until verified.\n';
  return s;
}

// --- Protected Files ---

function generateProtectedFiles(body, lang, fw) {
  var s = '# Protected Files\n\n';
  s += 'Never restructure these files. Read first. Change minimum lines.\n\n';
  s += '| File | Why |\n|------|-----|\n';
  if (fw && fw.protectedFiles) {
    for (var i = 0; i < fw.protectedFiles.length; i++) {
      s += '| `' + fw.protectedFiles[i] + '` | Framework config |\n';
    }
  }
  if (lang.lockFile) { s += '| `' + lang.lockFile + '` | Lock file - never edit manually |\n'; }
  if (lang.envFile) { s += '| `' + lang.envFile + '` | Secrets |\n'; }
  s += '| `.github/workflows/*` | CI/CD |\n';
  s += '| `migrations/*` | Order-sensitive |\n';
  if (body.protectedFiles) {
    var uf = body.protectedFiles.split('\n');
    for (var j = 0; j < uf.length; j++) {
      var f = uf[j].trim();
      if (f) { s += '| `' + f + '` | User-specified |\n'; }
    }
  }
  return s;
}

// --- Naming Conventions ---

function generateNamingConventions(body, lang) {
  var s = '# Naming Conventions - ' + lang.name + '\n\n';
  s += '| Element | Convention |\n|---------|----------|\n';
  s += '| Variables | `' + lang.varStyle + '` |\n';
  s += '| Functions | `' + lang.fnStyle + '` |\n';
  s += '| Files | `' + lang.fileStyle + '` |\n';
  s += '| Classes | `' + lang.classStyle + '` |\n';
  s += '| Constants | `' + lang.constStyle + '` |\n\n';
  s += '## Rules\n';
  s += '- Descriptive names: `remainingAttempts` not `ra`\n';
  s += '- Booleans: `is`, `has`, `should`, `can` prefix\n';
  s += '- No abbreviations unless universal (`id`, `url`, `api`)\n';
  s += '- Collections use plural names\n';
  s += '- Match domain terminology\n';
  return s;
}

// --- Testing ---

function generateTesting(body, lang) {
  var s = '# Testing Requirements\n\n';
  s += '**Framework:** ' + lang.test + ' | **Run:** `' + lang.testCmd + '`\n\n';
  s += '## Needs Tests\n';
  s += '- All public functions\n- Business logic\n- API endpoints (happy + error)\n- Data validation\n- Edge cases\n\n';
  s += '## Does NOT Need Tests\n';
  s += '- Simple getters/setters\n- Framework boilerplate\n- Third-party internals\n- One-time scripts\n\n';
  s += '## Structure\n';
  s += '- Test files: `*.test' + lang.ext + '` or `*_test' + lang.ext + '`\n';
  s += '- Descriptive names: "should return 404 when user not found"\n';
  s += '- One assertion per concept\n- No test interdependencies\n';
  return s;
}

// --- Commit Style ---

function generateCommitStyle() {
  var s = '# Commit Style\n\n```\n<type>: <description>\n\n<optional body - explain WHY>\n```\n\n';
  s += '| Type | When |\n|------|------|\n';
  s += '| `feat` | New feature |\n| `fix` | Bug fix |\n| `refactor` | Restructure |\n';
  s += '| `docs` | Documentation |\n| `test` | Tests |\n| `chore` | Build/config |\n\n';
  s += '- Under 72 chars\n- Imperative: "add" not "added"\n- No period at end\n- Body = WHY not WHAT\n';
  return s;
}

// --- Code Review Skill (deep) ---

function generateCodeReviewSkill(body, lang) {
  var s = '# Skill: code-review\n\n';
  s += '**Trigger:** "review", "check for issues", "audit", "before I ship"\n\n';
  s += '**Allowed Tools:** Read, Grep, Glob\n\n---\n\n';
  s += '## Checklist\n\n';
  s += '### Correctness\n';
  s += '- [ ] Does the code do what it claims?\n- [ ] Edge cases handled?\n- [ ] Error paths handled?\n- [ ] Concurrent access safe?\n\n';
  s += '### ' + lang.name + ' Conventions\n';
  for (var i = 0; i < lang.conventions.length; i++) { s += '- [ ] ' + lang.conventions[i] + '\n'; }
  s += '\n### ' + lang.name + ' Deep Checks\n';
  for (var j = 0; j < lang.reviewChecks.length; j++) { s += '- [ ] ' + lang.reviewChecks[j] + '\n'; }
  s += '\n### Security\n';
  for (var k = 0; k < Math.min(lang.securityChecks.length, 5); k++) { s += '- [ ] ' + lang.securityChecks[k] + '\n'; }
  s += '\n### Simplicity\n';
  s += '- [ ] Simplest approach?\n- [ ] Functions could be split?\n- [ ] Unnecessary abstractions?\n- [ ] New team member understands in 5 min?\n\n';
  s += '## Report\n`[file:line] - issue. Fix: specific fix.`\n';
  return s;
}

// --- Security Skill ---

function generateSecuritySkill(body, lang) {
  var s = '# Skill: security-review\n\n';
  s += '**Trigger:** "security review", "audit for vulnerabilities"\n\n';
  s += '**Allowed Tools:** Read, Grep, Glob\n\n---\n\n## Checklist\n\n';
  for (var i = 0; i < lang.securityChecks.length; i++) { s += '- [ ] ' + lang.securityChecks[i] + '\n'; }
  s += '\n### General\n';
  s += '- [ ] No hardcoded secrets in source\n- [ ] Sensitive data not logged\n';
  s += '- [ ] Auth on all non-public endpoints\n- [ ] Users access only their own data\n';
  s += '- [ ] Rate limiting on auth endpoints\n- [ ] Dependencies checked for CVEs\n';
  s += '- [ ] Error messages don\'t expose internals\n\n';
  s += '## Report\n`[SEVERITY] [file:line] - description. Fix: recommendation.`\n';
  s += 'Severity: CRITICAL | HIGH | MEDIUM | LOW\n';
  return s;
}

// --- Learn Skill ---

function generateLearnSkill() {
  var s = '# Skill: learn\n\n';
  s += '**Trigger:** `/learn` or "extract patterns" or "learn from this session"\n\n';
  s += '**Description:** Extracts reusable patterns, lessons, and decisions from the current session.\n\n';
  s += '**Allowed Tools:** Read, Edit, Write, Grep\n\n---\n\n';
  s += '## Steps\n\n';
  s += '1. **Review the conversation for:**\n';
  s += '   - Bugs fixed and root causes\n';
  s += '   - Patterns that worked well\n';
  s += '   - Mistakes made and corrections\n';
  s += '   - Decisions made\n';
  s += '   - Gotchas discovered\n\n';
  s += '2. **Check for conflicts** with existing entries in `memory/lessons.md` and `memory/decisions.md`\n\n';
  s += '3. **Categorize:**\n';
  s += '   - Bugs/errors -> append to `memory/lessons.md`\n';
  s += '   - Decisions -> append to `memory/decisions.md`\n';
  s += '   - Rejected approaches -> append to `memory/tasks/regret.md`\n\n';
  s += '4. **Format each entry:**\n';
  s += '```\n## [YYYY-MM-DD] - [short title]\n';
  s += '**Context:** what you were doing\n';
  s += '**Problem:** what went wrong or was learned\n';
  s += '**Solution:** what works\n';
  s += '**Apply when:** trigger conditions\n```\n\n';
  s += '5. **Skill scoring:** For each skill used this session, log to `memory/tasks/skill_scores.md`:\n';
  s += '   - Worked first time: `N` (no correction needed)\n';
  s += '   - Needed correction: `Y` with severity (minor/major/silent) and what failed\n\n';
  s += '6. **Report:** "Extracted N lessons: [titles]"\n';
  return s;
}

// --- Start Session Skill ---

function generateStartSessionSkill(body) {
  var s = '# Skill: start-session\n\n';
  s += '**Trigger:** "Start Session"\n\n';
  s += '**Description:** Initialize a working session with full project context.\n\n';
  s += '**Allowed Tools:** Read, Glob, Grep\n\n---\n\n';
  s += '## Steps\n\n';
  s += '1. Read `memory/STATUS.md` - get last session summary\n';
  s += '2. Read `memory/MEMORY.md` - get current context\n';
  s += '3. Report: "Ready. Last change: [summary]. What are we working on?"\n';
  s += '4. Add one observation if worth noting (optional, max one line)\n';
  return s;
}

// --- End Session Skill ---

function generateEndSessionSkill(body) {
  var s = '# Skill: end-session\n\n';
  s += '**Trigger:** "End Session"\n\n';
  s += '**Description:** Close out a session: learn, update status, commit.\n\n';
  s += '**Allowed Tools:** Read, Edit, Write, Grep, Bash\n\n---\n\n';
  s += '## Steps\n\n';
  s += '1. **Run `/learn`** - extract patterns from this session\n';
  s += '2. **Update `memory/tasks/skill_usage.md`** - log which skills fired\n';
  s += '3. **Update memory files** for anything changed this session\n';
  s += '4. **Update `memory/MEMORY.md`** - currentDate\n';
  s += '5. **Update `memory/STATUS.md`** - increment session, one-line summary\n';
  s += '6. **Commit changes:**\n';
  s += '   ```\n   git add -A\n   git commit -m "Session NNN: [summary]"\n   ```\n';
  s += '7. **Report:** "Session complete."\n';
  return s;
}

// --- Memory Files ---

function generateMemoryIndex(body) {
  var s = '# Memory Index\n\n';
  s += '_Persistent context across sessions._\n\n';
  s += '- [Project Status](STATUS.md) - Current phase, last session\n';
  s += '- [Lessons Learned](lessons.md) - Patterns and solutions\n';
  s += '- [Settled Decisions](decisions.md) - Locked architectural choices\n';
  s += '- [Regret Log](tasks/regret.md) - Rejected approaches\n';
  s += '- [Skill Scores](tasks/skill_scores.md) - Skill effectiveness tracking\n';
  s += '- [Skill Usage](tasks/skill_usage.md) - Last-used date per skill\n';
  s += '- [Velocity](tasks/velocity.md) - Estimate calibration\n\n';
  s += '# currentDate\n';
  s += 'Today is ' + new Date().toISOString().split('T')[0] + '. (Session 1)\n';
  return s;
}

function generateStatus(body, lang) {
  var s = '# ' + body.projectName + ' - Status\n\n';
  s += '## Current Phase\n';
  s += '> **Session 1 complete.** Initial setup generated by Clankbrain wizard.\n';
  s += '> Stack: ' + lang.name;
  if (body.framework) { s += ' + ' + body.framework; }
  if (body.database) { s += ' + ' + body.database; }
  s += '\n';
  return s;
}

function generateLessonsFile() {
  return '# Lessons Learned\n\n_Extracted patterns, mistakes, and solutions. Append after each session via `/learn`._\n\n_Format:_\n```\n## [YYYY-MM-DD] - [title]\n**Context:** what you were doing\n**Problem:** what went wrong\n**Solution:** what works\n**Apply when:** trigger conditions\n```\n';
}

function generateDecisionsFile() {
  return '# Settled Decisions\n\n_Architectural choices that are locked. Read before proposing changes to these areas._\n\n_Add decisions here as they are made. Once added, don\'t re-litigate without explicit discussion._\n';
}

function generateRegretFile() {
  return '# Rejected Approaches\n\n_Read before suggesting a solution. These were tried, evaluated, and discarded._\n\n| Approach | Why Rejected |\n|----------|-------------|\n| _(none yet)_ | _(session 1)_ |\n\n_Add entries as approaches are tried and rejected. This prevents re-proposing the same mistakes._\n';
}

function generateSkillScoresFile() {
  var s = '# Skill Effectiveness Scores\n\n';
  s += '_Binary log: did the skill output need correction? Y = needed fix, N = worked first time._\n\n';
  s += '| Date | Skill | Scope | Notes | Correction Needed | Severity | What Failed | Code Fixed | Skill Patched |\n';
  s += '|------|-------|-------|-------|-------------------|----------|-------------|------------|---------------|\n';
  s += '| ' + new Date().toISOString().split('T')[0] + ' | start-session | all | Session 1 - initial setup | N | - | - | - | - |\n';
  return s;
}

function generateSkillUsageFile() {
  var s = '# Skill Usage Tracker\n\n';
  s += '_Update at End Session: log which skills fired._\n';
  s += '_Flag any skill not used in 10+ sessions as stale._\n\n';
  s += '| ' + new Date().toISOString().split('T')[0] + ' | start-session | Session 1 - initial setup |\n';
  return s;
}

function generateVelocityFile() {
  var s = '# Velocity Tracker\n\n';
  s += '_Estimated vs actual sessions per task. Read before estimating._\n\n';
  s += '| Task | Estimated | Actual | Notes |\n';
  s += '|------|-----------|--------|-------|\n';
  s += '| _(none yet)_ | - | - | - |\n';
  return s;
}
