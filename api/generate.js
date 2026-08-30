// Template-based generator — no AI API needed, instant results

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

// --- Language/Framework Data ---

var LANG = {
  javascript: {
    name: 'JavaScript',
    ext: '.js',
    comment: '//',
    varStyle: 'camelCase',
    fnStyle: 'camelCase',
    fileStyle: 'kebab-case or camelCase',
    classStyle: 'PascalCase',
    constStyle: 'UPPER_SNAKE_CASE',
    lint: 'eslint',
    format: 'prettier',
    test: 'jest',
    testCmd: 'npm test',
    buildCmd: 'npm run build',
    devCmd: 'npm run dev',
    installCmd: 'npm install',
    lockFile: 'package-lock.json',
    envFile: '.env',
    conventions: [
      'Use `const` for values that do not change, `let` for values that do. Never `var`.',
      'Prefer arrow functions for callbacks and anonymous functions.',
      'Use template literals for string interpolation.',
      'Use async/await over .then() chains.',
      'Destructure objects and arrays when accessing multiple properties.',
      'Use optional chaining (?.) and nullish coalescing (??) for safe access.',
      'Export named exports over default exports (better refactoring support).',
      'Handle errors with try/catch in async functions — never swallow errors silently.'
    ],
    securityChecks: [
      'No eval(), new Function(), or innerHTML with user input',
      'Sanitize all user input before rendering or database queries',
      'Use parameterized queries — never string concatenation for SQL',
      'Validate and sanitize file uploads (type, size, extension)',
      'Never commit .env, API keys, or secrets',
      'Use helmet middleware for HTTP security headers (Express)',
      'Set CORS to specific origins, not wildcard in production'
    ]
  },
  python: {
    name: 'Python',
    ext: '.py',
    comment: '#',
    varStyle: 'snake_case',
    fnStyle: 'snake_case',
    fileStyle: 'snake_case',
    classStyle: 'PascalCase',
    constStyle: 'UPPER_SNAKE_CASE',
    lint: 'ruff or flake8',
    format: 'black',
    test: 'pytest',
    testCmd: 'pytest',
    buildCmd: 'python -m build',
    devCmd: 'python manage.py runserver',
    installCmd: 'pip install -r requirements.txt',
    lockFile: 'requirements.txt',
    envFile: '.env',
    conventions: [
      'Follow PEP 8 style guide.',
      'Use type hints for function parameters and return values.',
      'Use f-strings for string formatting.',
      'Use pathlib.Path over os.path for file operations.',
      'Use dataclasses or Pydantic models for structured data.',
      'Use context managers (with statements) for resource management.',
      'Prefer list/dict comprehensions over map/filter for simple transforms.',
      'Use logging module over print() for any output beyond debugging.'
    ],
    securityChecks: [
      'Use parameterized queries — never f-string or .format() for SQL',
      'Validate and sanitize all user input',
      'Use secrets module for token generation, not random',
      'Never pickle untrusted data',
      'Pin dependency versions in requirements.txt',
      'Set DEBUG=False in production',
      'Use CSRF protection on all forms'
    ]
  },
  java: {
    name: 'Java',
    ext: '.java',
    comment: '//',
    varStyle: 'camelCase',
    fnStyle: 'camelCase',
    fileStyle: 'PascalCase (matches class name)',
    classStyle: 'PascalCase',
    constStyle: 'UPPER_SNAKE_CASE',
    lint: 'checkstyle or spotbugs',
    format: 'google-java-format',
    test: 'JUnit 5',
    testCmd: 'mvn test or ./gradlew test',
    buildCmd: 'mvn package or ./gradlew build',
    devCmd: 'mvn spring-boot:run or ./gradlew bootRun',
    installCmd: 'mvn install or ./gradlew build',
    lockFile: 'pom.xml or build.gradle',
    envFile: 'application.properties or application.yml',
    conventions: [
      'One class per file, filename matches class name.',
      'Use meaningful variable names — no single letters except loop counters.',
      'Prefer composition over inheritance.',
      'Use Optional<T> instead of returning null.',
      'Use final for variables that should not be reassigned.',
      'Use try-with-resources for AutoCloseable objects.',
      'Keep methods under 30 lines — extract when they grow.',
      'Use @Override annotation on all overridden methods.'
    ],
    securityChecks: [
      'Use PreparedStatement — never string concatenation for SQL',
      'Validate all user input at controller boundaries',
      'Use BCrypt or Argon2 for password hashing, never MD5/SHA',
      'Sanitize HTML output to prevent XSS',
      'Configure CORS explicitly — never wildcard in production',
      'Use HTTPS everywhere, redirect HTTP',
      'Never log sensitive data (passwords, tokens, PII)'
    ]
  },
  go: {
    name: 'Go',
    ext: '.go',
    comment: '//',
    varStyle: 'camelCase (unexported), PascalCase (exported)',
    fnStyle: 'camelCase (unexported), PascalCase (exported)',
    fileStyle: 'snake_case',
    classStyle: 'PascalCase',
    constStyle: 'PascalCase (exported), camelCase (unexported)',
    lint: 'golangci-lint',
    format: 'gofmt (built-in)',
    test: 'go test (built-in)',
    testCmd: 'go test ./...',
    buildCmd: 'go build',
    devCmd: 'go run .',
    installCmd: 'go mod download',
    lockFile: 'go.sum',
    envFile: '.env',
    conventions: [
      'Accept interfaces, return structs.',
      'Handle errors explicitly — never ignore returned errors.',
      'Use short variable names in small scopes, descriptive in larger ones.',
      'Keep functions focused — one function, one job.',
      'Use table-driven tests.',
      'Group imports: stdlib, external, internal.',
      'Use context.Context for cancellation and timeouts.',
      'Prefer channels over shared memory for concurrency.'
    ],
    securityChecks: [
      'Use parameterized queries with database/sql',
      'Validate all user input at handler boundaries',
      'Use crypto/rand, not math/rand, for security-sensitive randomness',
      'Set timeouts on all HTTP clients and servers',
      'Use html/template (auto-escaping) over text/template for HTML',
      'Pin module versions in go.mod',
      'Never log secrets or tokens'
    ]
  },
  rust: {
    name: 'Rust',
    ext: '.rs',
    comment: '//',
    varStyle: 'snake_case',
    fnStyle: 'snake_case',
    fileStyle: 'snake_case',
    classStyle: 'PascalCase (structs/enums)',
    constStyle: 'UPPER_SNAKE_CASE',
    lint: 'clippy',
    format: 'rustfmt',
    test: 'cargo test (built-in)',
    testCmd: 'cargo test',
    buildCmd: 'cargo build --release',
    devCmd: 'cargo run',
    installCmd: 'cargo build',
    lockFile: 'Cargo.lock',
    envFile: '.env',
    conventions: [
      'Use Result<T, E> for fallible operations — avoid panic! in library code.',
      'Prefer &str over String for function parameters.',
      'Use derive macros (Debug, Clone, PartialEq) generously.',
      'Keep unsafe blocks minimal and well-documented.',
      'Use iterators and combinators over manual loops.',
      'Leverage the type system — make invalid states unrepresentable.',
      'Write doc comments (///) for all public items.',
      'Use thiserror for library errors, anyhow for application errors.'
    ],
    securityChecks: [
      'Minimize unsafe blocks — audit each one',
      'Use parameterized queries with sqlx or diesel',
      'Validate all user input at API boundaries',
      'Pin dependencies in Cargo.lock',
      'Use constant-time comparison for secrets',
      'Handle integer overflow explicitly',
      'Never log secrets or tokens'
    ]
  },
  csharp: {
    name: 'C#',
    ext: '.cs',
    comment: '//',
    varStyle: 'camelCase (local), PascalCase (properties)',
    fnStyle: 'PascalCase',
    fileStyle: 'PascalCase (matches class name)',
    classStyle: 'PascalCase',
    constStyle: 'PascalCase',
    lint: 'dotnet format / StyleCop',
    format: 'dotnet format',
    test: 'xUnit or NUnit',
    testCmd: 'dotnet test',
    buildCmd: 'dotnet build',
    devCmd: 'dotnet run',
    installCmd: 'dotnet restore',
    lockFile: '*.csproj',
    envFile: 'appsettings.json',
    conventions: [
      'Use PascalCase for public members, camelCase for private fields with _ prefix.',
      'Use var for local variables when the type is obvious.',
      'Prefer LINQ over manual loops for collection operations.',
      'Use async/await for I/O-bound operations.',
      'Use nullable reference types (enable in .csproj).',
      'Prefer record types for immutable data.',
      'Use ILogger<T> for logging, never Console.WriteLine in production.',
      'Use dependency injection — avoid static state.'
    ],
    securityChecks: [
      'Use parameterized queries with EF Core or Dapper',
      'Validate input with Data Annotations or FluentValidation',
      'Use ASP.NET Identity for auth — never roll your own',
      'Enable HTTPS redirection and HSTS',
      'Use anti-forgery tokens on forms',
      'Never store secrets in appsettings.json — use User Secrets or env vars',
      'Sanitize output to prevent XSS'
    ]
  },
  ruby: {
    name: 'Ruby', ext: '.rb', comment: '#',
    varStyle: 'snake_case', fnStyle: 'snake_case', fileStyle: 'snake_case',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'rubocop', format: 'rubocop', test: 'RSpec or Minitest',
    testCmd: 'bundle exec rspec', buildCmd: 'bundle exec rake build',
    devCmd: 'rails server', installCmd: 'bundle install',
    lockFile: 'Gemfile.lock', envFile: '.env',
    conventions: ['Follow Ruby Style Guide.', 'Use frozen_string_literal comment.', 'Prefer symbols over strings for hash keys.', 'Use guard clauses for early returns.', 'Keep methods under 15 lines.', 'Use meaningful variable names.', 'Prefer each/map/select over for loops.', 'Use Bundler for dependency management.'],
    securityChecks: ['Use parameterized queries with ActiveRecord', 'Use strong parameters in controllers', 'Enable CSRF protection', 'Never render user input as raw HTML', 'Pin gem versions in Gemfile', 'Use Rails credentials for secrets', 'Validate file uploads']
  },
  php: {
    name: 'PHP', ext: '.php', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'phpstan or psalm', format: 'php-cs-fixer', test: 'PHPUnit',
    testCmd: 'vendor/bin/phpunit', buildCmd: 'composer build',
    devCmd: 'php artisan serve', installCmd: 'composer install',
    lockFile: 'composer.lock', envFile: '.env',
    conventions: ['Follow PSR-12 coding standard.', 'Use type declarations for parameters and return types.', 'Use null coalescing operator (??) over isset().', 'Prefer named arguments for clarity.', 'Use enums (PHP 8.1+) over class constants.', 'Keep controllers thin — move logic to services.', 'Use dependency injection via constructor.', 'Use match() over switch() when appropriate.'],
    securityChecks: ['Use prepared statements with PDO', 'Validate all user input', 'Use password_hash() and password_verify()', 'Enable CSRF protection', 'Never use eval() or include with user input', 'Set display_errors=Off in production', 'Use HTTPS and secure cookie flags']
  },
  swift: {
    name: 'Swift', ext: '.swift', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'camelCase or PascalCase',
    lint: 'swiftlint', format: 'swift-format', test: 'XCTest',
    testCmd: 'swift test', buildCmd: 'swift build',
    devCmd: 'swift run', installCmd: 'swift package resolve',
    lockFile: 'Package.resolved', envFile: '.env',
    conventions: ['Use let over var whenever possible.', 'Use guard for early exits.', 'Prefer value types (struct) over reference types (class).', 'Use protocols for abstraction.', 'Use meaningful names — avoid abbreviations.', 'Handle optionals safely with if let or guard let.', 'Use Result type for error handling.', 'Follow Swift API Design Guidelines.'],
    securityChecks: ['Use Keychain for storing secrets', 'Validate server certificates (no disable SSL)', 'Use App Transport Security', 'Sanitize all user input', 'Use parameterized queries with Core Data', 'Never hardcode API keys', 'Enable data protection on files']
  },
  kotlin: {
    name: 'Kotlin', ext: '.kt', comment: '//',
    varStyle: 'camelCase', fnStyle: 'camelCase', fileStyle: 'PascalCase',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'ktlint or detekt', format: 'ktlint', test: 'JUnit 5 or Kotest',
    testCmd: './gradlew test', buildCmd: './gradlew build',
    devCmd: './gradlew bootRun', installCmd: './gradlew build',
    lockFile: 'gradle.lockfile', envFile: 'application.yml',
    conventions: ['Use val over var whenever possible.', 'Use data classes for DTOs and value objects.', 'Use sealed classes for restricted hierarchies.', 'Prefer extension functions over utility classes.', 'Use scope functions (let, run, apply, also) appropriately.', 'Use coroutines for async operations.', 'Use null safety — avoid !! operator.', 'Keep functions concise with expression bodies when appropriate.'],
    securityChecks: ['Use parameterized queries with JPA or Exposed', 'Validate input at controller boundaries', 'Use BCrypt for password hashing', 'Configure CORS explicitly', 'Use Spring Security for auth', 'Never log sensitive data', 'Pin dependency versions']
  },
  other: {
    name: 'Custom', ext: '', comment: '#',
    varStyle: 'project-specific', fnStyle: 'project-specific', fileStyle: 'project-specific',
    classStyle: 'PascalCase', constStyle: 'UPPER_SNAKE_CASE',
    lint: 'project-specific', format: 'project-specific', test: 'project-specific',
    testCmd: '# add test command', buildCmd: '# add build command',
    devCmd: '# add dev command', installCmd: '# add install command',
    lockFile: '', envFile: '.env',
    conventions: ['Define and document naming conventions for the team.', 'Keep functions small and focused.', 'Write meaningful variable names.', 'Handle errors explicitly.', 'Write tests for critical paths.', 'Document public APIs.', 'Review code before merging.', 'Keep dependencies up to date.'],
    securityChecks: ['Validate all user input', 'Use parameterized queries for database access', 'Never hardcode secrets', 'Use HTTPS everywhere', 'Sanitize output to prevent injection', 'Review dependencies for vulnerabilities', 'Follow least-privilege principle']
  }
};

var FRAMEWORKS = {
  'next.js': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['next.config.js', 'middleware.ts'], structure: 'app/ (App Router) or pages/ (Pages Router), components/, lib/, public/' },
  'react': { devCmd: 'npm start', buildCmd: 'npm run build', protectedFiles: ['vite.config.ts', 'tsconfig.json'], structure: 'src/components/, src/hooks/, src/pages/, src/utils/, public/' },
  'express': { devCmd: 'node server.js or npm run dev', buildCmd: 'npm run build', protectedFiles: ['server.js'], structure: 'routes/, controllers/, middleware/, models/, utils/' },
  'django': { devCmd: 'python manage.py runserver', buildCmd: 'python manage.py collectstatic', protectedFiles: ['manage.py', 'settings.py', 'urls.py'], structure: 'apps/, templates/, static/, media/, manage.py' },
  'flask': { devCmd: 'flask run', buildCmd: 'pip install -e .', protectedFiles: ['app.py', 'config.py'], structure: 'app/, templates/, static/, models/, routes/' },
  'fastapi': { devCmd: 'uvicorn main:app --reload', buildCmd: 'pip install -e .', protectedFiles: ['main.py'], structure: 'app/routers/, app/models/, app/schemas/, app/services/' },
  'spring boot': { devCmd: 'mvn spring-boot:run', buildCmd: 'mvn package', protectedFiles: ['pom.xml', 'application.properties'], structure: 'src/main/java/com/.../{controllers,services,repositories,models}/, src/main/resources/' },
  'rails': { devCmd: 'rails server', buildCmd: 'rake assets:precompile', protectedFiles: ['config/routes.rb', 'db/schema.rb', 'Gemfile'], structure: 'app/{models,views,controllers,services}/, config/, db/, lib/' },
  'laravel': { devCmd: 'php artisan serve', buildCmd: 'composer install --optimize-autoloader', protectedFiles: ['routes/web.php', 'routes/api.php', '.env'], structure: 'app/{Models,Http/Controllers,Services}/, resources/views/, routes/, database/' },
  'vue': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['vite.config.ts'], structure: 'src/components/, src/views/, src/stores/, src/composables/, src/router/' },
  'angular': { devCmd: 'ng serve', buildCmd: 'ng build', protectedFiles: ['angular.json', 'tsconfig.json'], structure: 'src/app/{components,services,models,guards}/, src/assets/, src/environments/' },
  'svelte': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['svelte.config.js', 'vite.config.ts'], structure: 'src/routes/, src/lib/, src/components/, static/' },
  'gin': { devCmd: 'go run .', buildCmd: 'go build', protectedFiles: ['main.go'], structure: 'handlers/, models/, middleware/, services/, config/' },
  'actix': { devCmd: 'cargo run', buildCmd: 'cargo build --release', protectedFiles: ['Cargo.toml'], structure: 'src/{handlers,models,services,middleware}.rs' },
  'nuxt': { devCmd: 'npm run dev', buildCmd: 'npm run build', protectedFiles: ['nuxt.config.ts'], structure: 'pages/, components/, composables/, server/, layouts/, plugins/' }
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

  // Always generate CLAUDE.md
  files['CLAUDE.md'] = generateClaudeMd(body, lang, fw);

  // Convention-based files
  for (var i = 0; i < conventions.length; i++) {
    var conv = conventions[i];
    if (conv === 'plan-before-edit') {
      files['rules/plan-before-edit.md'] = generatePlanBeforeEdit(body, lang);
    }
    if (conv === 'protected-files') {
      files['rules/protected-files.md'] = generateProtectedFiles(body, lang, fw);
    }
    if (conv === 'naming-conventions') {
      files['rules/naming-conventions.md'] = generateNamingConventions(body, lang);
    }
    if (conv === 'testing') {
      files['rules/testing.md'] = generateTesting(body, lang, fw);
    }
    if (conv === 'commit-style') {
      files['rules/commit-style.md'] = generateCommitStyle(body);
    }
    if (conv === 'code-review') {
      files['skills/code-review/SKILL.md'] = generateCodeReviewSkill(body, lang);
    }
    if (conv === 'security') {
      files['skills/security-review/SKILL.md'] = generateSecuritySkill(body, lang);
    }
    if (conv === 'memory-system') {
      files['memory/MEMORY.md'] = generateMemoryIndex(body);
      files['memory/STATUS.md'] = generateStatus(body);
      files['memory/lessons.md'] = '# Lessons Learned\n\n_Extracted patterns, mistakes, and solutions. Append after each session._\n';
      files['memory/decisions.md'] = '# Settled Decisions\n\n_Architectural choices that are locked. Read before proposing changes._\n';
    }
  }

  return files;
}

function generateClaudeMd(body, lang, fw) {
  var s = '';
  s += '# ' + body.projectName + '\n\n';
  s += '## What This Project Is\n';
  s += (PROJECT_TYPES[body.projectType] || 'A software project.') + '\n\n';

  s += '## Tech Stack\n';
  s += '- **Language:** ' + lang.name + '\n';
  if (body.framework) { s += '- **Framework:** ' + body.framework + '\n'; }
  if (body.database) { s += '- **Database:** ' + body.database + '\n'; }
  s += '- **Linting:** ' + lang.lint + '\n';
  s += '- **Formatting:** ' + lang.format + '\n';
  s += '- **Testing:** ' + lang.test + '\n';
  s += '\n';

  s += '## Commands\n';
  s += '```\n';
  s += 'Install:  ' + (fw ? fw.devCmd.split(' ')[0] === 'npm' ? 'npm install' : lang.installCmd : lang.installCmd) + '\n';
  s += 'Dev:      ' + (fw ? fw.devCmd : lang.devCmd) + '\n';
  s += 'Build:    ' + (fw ? fw.buildCmd : lang.buildCmd) + '\n';
  s += 'Test:     ' + lang.testCmd + '\n';
  s += 'Lint:     ' + lang.lint + ' .\n';
  s += '```\n\n';

  if (fw && fw.structure) {
    s += '## File Structure\n';
    s += '```\n' + fw.structure + '\n```\n\n';
  }

  s += '## Coding Conventions\n';
  for (var i = 0; i < lang.conventions.length; i++) {
    s += '- ' + lang.conventions[i] + '\n';
  }
  s += '\n';

  if (body.additionalContext) {
    s += '## Additional Context\n';
    s += body.additionalContext + '\n\n';
  }

  // Add rule references
  var conventions = body.conventions || [];
  var hasRules = false;
  for (var j = 0; j < conventions.length; j++) {
    if (conventions[j] === 'plan-before-edit' || conventions[j] === 'protected-files' ||
        conventions[j] === 'naming-conventions' || conventions[j] === 'testing' ||
        conventions[j] === 'commit-style') {
      hasRules = true;
      break;
    }
  }
  if (hasRules) {
    s += '## Rules\n';
    if (conventions.indexOf('plan-before-edit') >= 0) { s += '@rules/plan-before-edit.md\n'; }
    if (conventions.indexOf('protected-files') >= 0) { s += '@rules/protected-files.md\n'; }
    if (conventions.indexOf('naming-conventions') >= 0) { s += '@rules/naming-conventions.md\n'; }
    if (conventions.indexOf('testing') >= 0) { s += '@rules/testing.md\n'; }
    if (conventions.indexOf('commit-style') >= 0) { s += '@rules/commit-style.md\n'; }
    s += '\n';
  }

  return s;
}

function generatePlanBeforeEdit(body, lang) {
  var s = '';
  s += '# Plan Before Edit\n\n';
  s += '**Before making ANY edit to ANY code file, present a plan and wait for approval.**\n\n';
  s += 'This applies to every change — no matter how small or obvious.\n\n';
  s += '---\n\n';
  s += '## Required Plan Format\n\n';
  s += '### Problem / Feature\n';
  s += 'One clear sentence: what is broken or what needs to be added.\n\n';
  s += '### All Related Functions\n';
  s += 'List every function touched — with file path and line number. Verified against codebase before showing.\n\n';
  s += '### Before (relevant lines only)\n';
  s += '```' + body.language + '\n';
  s += '// the current code that will change\n';
  s += '```\n\n';
  s += '### After\n';
  s += '```' + body.language + '\n';
  s += '// the replacement code\n';
  s += '```\n\n';
  s += '### Why this will work\n';
  s += 'One sentence explaining the mechanism.\n\n';
  s += '### Scope / Blast Radius\n';
  s += '- **Files touched:** every file that will change\n';
  s += '- **Lines changed:** exact count from Before/After\n';
  s += '- **Type:** Logic change | Refactor | Config/data only\n';
  s += '- **Affected at runtime:** what breaks if this goes wrong\n\n';
  s += '### Evaluation\n';
  s += '- **Risks:** concrete risks, each with a mitigation\n';
  s += '- **Confidence:** High | Medium | Low\n';
  s += '- **Verdict:** Proceed | Hold | Redesign\n\n';
  s += '### Challenge\n';
  s += 'The strongest argument AGAINST this approach. If none: "No credible alternative."\n\n';
  s += '### Rollback\n';
  s += 'Exact steps to undo:\n';
  s += '```\ngit restore path/to/file\n```\n\n';
  s += '---\n\n';
  s += '## Rules\n\n';
  s += '1. **Wait for approval.** Show the plan, wait for "yes" / "go" / "do it". Only then edit.\n';
  s += '2. **Show full plan after every adjustment.** When the user corrects anything, restate the entire plan.\n';
  s += '3. **Verify after every edit.** Read back the changed lines and confirm they match the plan.\n';
  s += '4. **Confirm actual scope.** After all edits, run `git diff --stat` and report.\n';
  return s;
}

function generateProtectedFiles(body, lang, fw) {
  var s = '';
  s += '# Protected Files\n\n';
  s += 'These files must never be restructured. Read the full file first. Change only the minimum lines needed.\n\n';
  s += '| File | Why |\n';
  s += '|------|-----|\n';

  // Framework-specific protected files
  if (fw && fw.protectedFiles) {
    for (var i = 0; i < fw.protectedFiles.length; i++) {
      s += '| `' + fw.protectedFiles[i] + '` | Framework configuration — restructuring breaks the build |\n';
    }
  }

  // Common protected files
  if (lang.lockFile) { s += '| `' + lang.lockFile + '` | Dependency lock file — never edit manually |\n'; }
  if (lang.envFile) { s += '| `' + lang.envFile + '` | Environment config — contains secrets |\n'; }
  s += '| `.github/workflows/*` | CI/CD pipelines — changes affect deployment |\n';
  s += '| `migrations/*` | Database migrations — order-sensitive, never restructure |\n';

  // User-specified protected files
  if (body.protectedFiles) {
    var userFiles = body.protectedFiles.split('\n');
    for (var j = 0; j < userFiles.length; j++) {
      var f = userFiles[j].trim();
      if (f) { s += '| `' + f + '` | User-specified — do not restructure |\n'; }
    }
  }

  s += '\n';
  return s;
}

function generateNamingConventions(body, lang) {
  var s = '';
  s += '# Naming Conventions — ' + lang.name + '\n\n';
  s += '| Element | Convention | Example |\n';
  s += '|---------|-----------|--------|\n';
  s += '| Variables | `' + lang.varStyle + '` | `userName`, `itemCount` |\n';
  s += '| Functions | `' + lang.fnStyle + '` | `getUserById`, `calculateTotal` |\n';
  s += '| Files | `' + lang.fileStyle + '` | — |\n';
  s += '| Classes/Types | `' + lang.classStyle + '` | `UserService`, `PaymentProcessor` |\n';
  s += '| Constants | `' + lang.constStyle + '` | `MAX_RETRIES`, `API_BASE_URL` |\n';
  s += '\n';
  s += '## Rules\n\n';
  s += '- Use descriptive names — `remainingAttempts` not `ra`\n';
  s += '- Boolean variables start with `is`, `has`, `should`, `can` — e.g. `isActive`, `hasPermission`\n';
  s += '- Functions that return booleans follow the same pattern — `isValid()`, `hasAccess()`\n';
  s += '- Avoid abbreviations unless universally understood (`id`, `url`, `api`)\n';
  s += '- Collections use plural names — `users`, `orderItems`\n';
  s += '- Match variable names to domain terminology — if the business calls it "enrollment", don\'t call it "registration" in code\n';
  return s;
}

function generateTesting(body, lang, fw) {
  var s = '';
  s += '# Testing Requirements\n\n';
  s += '**Framework:** ' + lang.test + '\n';
  s += '**Run:** `' + lang.testCmd + '`\n\n';
  s += '## What Needs Tests\n\n';
  s += '- [ ] All public functions and methods\n';
  s += '- [ ] Business logic and calculations\n';
  s += '- [ ] API endpoints — happy path + error cases\n';
  s += '- [ ] Data validation and sanitization\n';
  s += '- [ ] Edge cases: empty input, null, boundary values\n';
  s += '- [ ] Error handling paths\n\n';
  s += '## What Does NOT Need Tests\n\n';
  s += '- Simple getters/setters with no logic\n';
  s += '- Framework-generated boilerplate\n';
  s += '- Third-party library internals\n';
  s += '- One-time scripts or migrations\n\n';
  s += '## Test Structure\n\n';
  s += '- Test files live next to source files or in a `tests/` directory\n';
  s += '- Name test files `*.test' + lang.ext + '` or `*_test' + lang.ext + '`\n';
  s += '- Use descriptive test names: "should return 404 when user not found"\n';
  s += '- Each test does one thing — arrange, act, assert\n';
  s += '- No test should depend on another test\n';
  return s;
}

function generateCommitStyle(body) {
  var s = '';
  s += '# Commit Message Style\n\n';
  s += '## Format\n\n';
  s += '```\n';
  s += '<type>: <short description>\n';
  s += '\n';
  s += '<optional body — explain WHY, not WHAT>\n';
  s += '```\n\n';
  s += '## Types\n\n';
  s += '| Type | When |\n';
  s += '|------|------|\n';
  s += '| `feat` | New feature or capability |\n';
  s += '| `fix` | Bug fix |\n';
  s += '| `refactor` | Code restructuring without behavior change |\n';
  s += '| `docs` | Documentation only |\n';
  s += '| `test` | Adding or updating tests |\n';
  s += '| `chore` | Build, config, dependency changes |\n';
  s += '| `style` | Formatting, whitespace (no logic change) |\n\n';
  s += '## Rules\n\n';
  s += '- Subject line under 72 characters\n';
  s += '- Use imperative mood: "add feature" not "added feature"\n';
  s += '- No period at the end of the subject line\n';
  s += '- Body explains WHY the change was made, not what changed (the diff shows that)\n';
  s += '- Reference issue numbers when applicable: "fix: resolve login timeout (#42)"\n';
  return s;
}

function generateCodeReviewSkill(body, lang) {
  var s = '';
  s += '# Skill: code-review\n\n';
  s += '**Trigger:** "review", "check for issues", "audit", "before I ship"\n\n';
  s += '**Description:** ' + lang.name + ' code review checklist.\n\n';
  s += '**Allowed Tools:** Read, Grep, Glob\n\n';
  s += '---\n\n';
  s += '## Checklist\n\n';
  s += '### Correctness\n';
  s += '- [ ] Does the code do what it claims to do?\n';
  s += '- [ ] Are edge cases handled (null, empty, boundary values)?\n';
  s += '- [ ] Are error paths handled — no swallowed exceptions?\n';
  s += '- [ ] Does it handle concurrent access safely (if applicable)?\n\n';
  s += '### ' + lang.name + ' Conventions\n';
  for (var i = 0; i < lang.conventions.length; i++) {
    s += '- [ ] ' + lang.conventions[i] + '\n';
  }
  s += '\n### Security\n';
  for (var j = 0; j < Math.min(lang.securityChecks.length, 5); j++) {
    s += '- [ ] ' + lang.securityChecks[j] + '\n';
  }
  s += '\n### Simplicity\n';
  s += '- [ ] Is this the simplest approach that works?\n';
  s += '- [ ] Could any function be split for clarity?\n';
  s += '- [ ] Are there unnecessary abstractions or premature optimizations?\n';
  s += '- [ ] Would a new team member understand this in 5 minutes?\n\n';
  s += '## Report Format\n\n';
  s += 'For each issue: `[file:line] — issue description. Fix: specific fix.`\n';
  s += 'For clean files: `[file] — No issues found.`\n';
  return s;
}

function generateSecuritySkill(body, lang) {
  var s = '';
  s += '# Skill: security-review\n\n';
  s += '**Trigger:** "security review", "check security", "audit for vulnerabilities"\n\n';
  s += '**Description:** Security review for ' + lang.name + ' projects.\n\n';
  s += '**Allowed Tools:** Read, Grep, Glob\n\n';
  s += '---\n\n';
  s += '## Checklist\n\n';
  for (var i = 0; i < lang.securityChecks.length; i++) {
    s += '- [ ] ' + lang.securityChecks[i] + '\n';
  }
  s += '\n### General\n';
  s += '- [ ] No hardcoded secrets, API keys, or passwords in source code\n';
  s += '- [ ] Sensitive data not logged (passwords, tokens, PII)\n';
  s += '- [ ] Authentication required on all non-public endpoints\n';
  s += '- [ ] Authorization checked — users can only access their own data\n';
  s += '- [ ] Rate limiting on authentication and public endpoints\n';
  s += '- [ ] Dependencies checked for known vulnerabilities\n';
  s += '- [ ] File uploads validated (type, size, extension)\n';
  s += '- [ ] Error messages don\'t expose internal details to users\n\n';
  s += '## Report Format\n\n';
  s += 'For each finding: `[SEVERITY] [file:line] — description. Fix: recommendation.`\n';
  s += 'Severity: CRITICAL | HIGH | MEDIUM | LOW | INFO\n';
  return s;
}

function generateMemoryIndex(body) {
  var s = '';
  s += '# Memory Index\n\n';
  s += '_Persist lessons, decisions, and project context across sessions._\n\n';
  s += '- [Project Status](STATUS.md) — Current phase, last session summary\n';
  s += '- [Lessons Learned](lessons.md) — Patterns, mistakes, and solutions\n';
  s += '- [Settled Decisions](decisions.md) — Architectural choices that are locked\n\n';
  s += '# currentDate\n';
  s += 'Today is ' + new Date().toISOString().split('T')[0] + '. (Session 1)\n';
  return s;
}

function generateStatus(body) {
  var s = '';
  s += '# ' + body.projectName + ' — Status\n\n';
  s += '## Current Phase\n';
  s += '> **Session 1 complete.** Initial Claude Code setup generated by Clankbrain wizard.\n';
  s += '>\n';
  s += '> Stack: ' + (LANG[body.language] || LANG.other).name;
  if (body.framework) { s += ' + ' + body.framework; }
  if (body.database) { s += ' + ' + body.database; }
  s += '\n';
  return s;
}
