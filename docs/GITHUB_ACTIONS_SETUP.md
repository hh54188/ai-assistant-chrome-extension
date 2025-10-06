# GitHub Actions Setup

This document describes the GitHub Actions workflows and issue templates configured for this project.

## Workflows Overview

### 1. CI Pipeline (`.github/workflows/ci-pipeline.yml`)
The main CI pipeline that runs on every push and pull request to the master branch.

**Features:**
- Unit tests for Chrome Extension components and stores
- E2E tests with Puppeteer and virtual display
- Build verification across multiple operating systems
- Coverage reporting for store tests
- Artifact upload for coverage reports and screenshots

**Jobs:**
- `unit-tests`: Runs component and store tests with coverage reporting
- `e2e-tests`: Runs end-to-end tests with Chrome browser (chat, image upload, drag-drop)
- `build-verification`: Verifies the extension builds correctly with matrix strategy

**E2E Test Types:**
- Gemini Chat functionality
- Image upload capabilities
- Drag and drop features
- Screenshot capture for debugging

**Triggers:**
- Push to master branch
- Pull requests to master branch
- Manual workflow dispatch

**Skip Conditions:**
- Jobs will be skipped if commit messages contain `[skip ci]` or `[no ci]`
- Useful for documentation updates, minor fixes, or work-in-progress commits

**Artifacts Generated:**
- `stores-coverage-report`: Coverage analysis and HTML reports
- `e2e-test-screenshots`: Screenshots from E2E test runs
- `build-artifacts`: Built extension files for verification

### 2. Auto Fix CI (`.github/workflows/auto-fix-ci.yml`)
Automatically attempts to fix CI failures by creating fix branches and PRs.

**Trigger:** Runs after CI Pipeline completes with failure status or manual dispatch with workflow run ID
**Features:**
- Uses Cursor AI (GPT-5) to analyze and fix CI failures
- Creates persistent fix branches with `ci-fix` prefix
- Generates PR comments with compare links
- Includes comprehensive verification process with test branches
- Handles both PR-based and direct branch workflow runs
- Prevents self-triggering by excluding Auto Fix CI workflow failures

**Verification Process:**
1. Creates verification branch: `verify-fix-{WORKFLOW_RUN_ID}`
2. Merges fix branch into verification branch
3. Pushes verification branch to trigger CI
4. Waits for CI completion and validates results
5. Only proceeds with compare link if CI passes on verification branch

**Permissions:**
- `contents: write` - Push branches, create commits
- `pull-requests: write` - Comment on PRs
- `actions: write` - Trigger workflows on verification branch
- `checks: write` - Create/update check runs for verification status

### 3. Auto Update Docs (`.github/workflows/auto-update-docs.yml`)
Automatically updates documentation when PRs are merged or CI Pipeline completes successfully.

**Two Job Types:**

#### Auto Docs Job
**Trigger:** Runs when PRs are merged to master (excluding docs-only PRs)
**Features:**
- Uses Cursor AI (GPT-5) to analyze PR changes
- Updates relevant documentation based on incremental code changes
- Maintains persistent docs branches with `docs` prefix
- Creates draft PRs with documentation updates
- Prevents circular updates for docs-only changes

#### CI Docs Job
**Trigger:** Runs after successful CI Pipeline completion
**Features:**
- Detects changed files from CI Pipeline trigger
- Analyzes significant changes (JS, JSX, TS, TSX, JSON, MD, YAML files)
- Updates technical documentation based on code changes
- Maintains persistent docs branches with `ci-docs` prefix
- Focuses on API endpoints, configuration, features, and testing procedures

**Smart Filtering:**
- ✅ Runs: PR from `feature/new-auth` merged → Documentation auto-updated
- ✅ Runs: PR from `bugfix/login-issue` merged → Documentation auto-updated
- ✅ Runs: CI Pipeline with code changes → Technical docs auto-updated
- ❌ Skips: PR from `docs/api-update` → No auto-update (avoids circular updates)
- ❌ Skips: PR from `ci-docs/update-api` → No auto-update
- ❌ Skips: PR from `coverage-improvement-*` → No auto-update
- ❌ Skips: PR is closed without merging → No auto-update
- ❌ Skips: PR created by `cursoragent` → No auto-update (avoids self-triggering)

### 4. Store Coverage Enforcer (`.github/workflows/coverage-enforcer.yml`)
Automatically ensures store test coverage reaches 100%.

**Trigger:** Runs after CI Pipeline completes successfully
**Features:**
- Downloads and analyzes coverage artifacts from CI Pipeline
- Parses lcov.info coverage data using Node.js analysis tools
- Identifies uncovered code paths with detailed analysis
- Generates additional tests automatically using Cursor AI (GPT-5)
- Creates pull requests with test improvements
- Prevents duplicate PRs for the same coverage issue
- Smart filtering: only runs when `chrome-extension/src/` folder changes are detected
- Exits early if coverage is already 100%

**Coverage Analysis Process:**
1. **Change Detection**: Analyzes committed files to detect `src/` folder changes
2. **Artifact Download**: Downloads coverage artifacts from CI Pipeline
3. **Coverage Verification**: Validates coverage files and reports
4. **Analysis**: Uses Node.js tools to parse coverage data
5. **Gap Identification**: Identifies specific uncovered lines and functions
6. **Test Generation**: Creates comprehensive tests using AI assistance
7. **Verification**: Ensures generated tests actually improve coverage

## GitHub Issue Templates

The project includes AI-assisted issue templates to encourage users to try AI solutions first before creating issues.

### Bug Report Template (`.github/ISSUE_TEMPLATE/bug_report.md`)
- **Title Prefix:** `[BUG]`
- **Labels:** `bug`
- **AI-First Approach:** Encourages users to try AI assistance before reporting
- **Sections:**
  - 🤖 **Try AI First!** - Prominent section encouraging AI assistance
  - What happened?
  - What did you expect?
  - Steps to reproduce
  - Environment details (OS, Browser, Extension Version)
  - Error messages
  - Additional info

### Feature Request Template (`.github/ISSUE_TEMPLATE/feature_request.md`)
- **Title Prefix:** `[FEATURE]`
- **Labels:** `enhancement`
- **AI-First Approach:** Encourages users to check if feature already exists via AI
- **Sections:**
  - 🤖 **Try AI First!** - Prominent section encouraging AI assistance
  - What feature would you like?
  - Why is this needed?
  - Any examples?

**Template Features:**
- Emoji-enhanced sections for better visual appeal
- Clear AI-first messaging to reduce unnecessary issues
- Structured sections for consistent issue reporting
- Automatic label assignment for better organization

## Store Coverage Enforcer Details

### How It Works

1. **Coverage Analysis**: Downloads coverage artifacts from the CI Pipeline and parses the lcov.info file to determine current coverage percentages.

2. **Gap Identification**: Identifies specific uncovered lines in store files that need additional tests.

3. **Test Generation**: Automatically generates test files for uncovered code paths using AI assistance.

4. **Verification**: Runs the tests to ensure they pass and improve coverage.

5. **PR Creation**: Creates a pull request with the generated tests, but only if:
   - Coverage is below 100%
   - No existing coverage improvement PR exists
   - The generated tests actually improve coverage

### Coverage Requirements

The workflow enforces 100% coverage for:
- **Lines**: All executable lines must be covered
- **Functions**: All functions must be called in tests
- **Branches**: All conditional branches must be tested

### Configuration

The workflow uses the following npm scripts:
- `npm run test:stores` - Runs store tests
- `npm run test:stores:coverage` - Runs store tests with coverage reporting

Coverage is configured in `chrome-extension/package.json`:
```json
"test:stores:coverage": "vitest --coverage --run src/tests/stores/ --coverage.include='src/stores/**/*Store.js'"
```

### Artifacts

The workflow generates several artifacts:
- `coverage-analysis-report` - Contains coverage analysis and test suggestions
- Coverage reports in HTML and LCOV formats

### Permissions Required

The workflows require the following GitHub permissions:

**Auto Fix CI:**
- `contents: write` - Push branches, create commits
- `pull-requests: write` - Comment on PRs
- `actions: write` - Trigger workflows on verification branch
- `checks: write` - Create/update check runs for verification status

**Auto Update Docs:**
- `contents: write` - Create branches and commits
- `pull-requests: write` - Create and manage PRs

**Store Coverage Enforcer:**
- `contents: write` - Push branches, create commits
- `pull-requests: write` - Create and manage PRs
- `actions: write` - Trigger workflows
- `checks: write` - Create/update check runs
- `issues: write` - Create issues for tracking

### Environment Variables

Required secrets:
- `CURSOR_API_KEY` - For AI-powered test generation and documentation updates
- `GEMINI_API_KEY` - For E2E tests with Gemini AI
- `GH_TOKEN` - GitHub token for CLI operations (can use `GITHUB_TOKEN` as fallback)
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Setup Instructions

### 1. Enable GitHub Actions
GitHub Actions are enabled by default when the workflow files are present in `.github/workflows/`.

### 2. Configure Repository Secrets
Add the following secrets in your repository settings (`Settings` → `Secrets and variables` → `Actions`):

**Required Secrets:**
- `CURSOR_API_KEY`: Your Cursor API key for AI-powered test generation and documentation updates
- `GEMINI_API_KEY`: Your Gemini API key for E2E tests
- `GH_TOKEN`: GitHub personal access token for CLI operations (optional, falls back to `GITHUB_TOKEN`)

**Automatic Secrets:**
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### 3. Verify Workflow Triggers
The workflows are configured to trigger on:
- **CI Pipeline**: Push to master, PRs to master, manual dispatch
- **Auto Fix CI**: CI Pipeline failures, manual dispatch with workflow run ID
- **Auto Update Docs**: PR merges to master (excluding docs-only PRs)
- **Store Coverage Enforcer**: Successful CI Pipeline completion

### 4. Monitor Workflow Runs
You can monitor workflow runs in the GitHub Actions tab of your repository:
- View real-time logs and status
- Download artifacts (coverage reports, screenshots, build files)
- Re-run failed workflows
- View workflow dependencies and triggers

## Troubleshooting

### Common Issues

1. **Coverage Not Generated**: Ensure the CI Pipeline is running the coverage step and uploading artifacts.

2. **Permission Errors**: Verify that the GitHub token has the required permissions for each workflow.

3. **Test Generation Fails**: Check that the CURSOR_API_KEY secret is properly configured.

4. **Duplicate PRs**: The workflows prevent duplicate PRs by checking for existing open PRs.

5. **Auto Fix CI Not Triggering**: Ensure the workflow is triggered by CI Pipeline failures, not by the Auto Fix CI workflow itself.

6. **Docs Update Not Running**: Verify the PR was merged (not just closed) and doesn't start with "docs/", "ci-docs/", or "coverage-improvement-".

7. **Coverage Enforcer Skipped**: Check if changes were made to files in the `chrome-extension/src/` folder.

8. **E2E Tests Failing**: Verify GEMINI_API_KEY is configured and Chrome dependencies are properly installed.

9. **Auto Fix CI Verification Fails**: Check that the verification branch CI passes before the fix is considered successful.

10. **CI Docs Not Triggering**: Verify the CI Pipeline completed successfully and contains significant file changes.

11. **Coverage Analysis Fails**: Ensure coverage artifacts are properly downloaded and contain valid lcov.info files.

12. **Virtual Display Issues**: For E2E tests, verify Xvfb is properly installed and DISPLAY environment variable is set.

13. **Workflow Run ID Missing**: For manual Auto Fix CI triggers, ensure the workflow run ID is provided correctly.

14. **Self-Triggering Prevention**: Workflows exclude runs created by `cursoragent` to prevent infinite loops.

15. **CI Pipeline Skipped**: If the CI pipeline is being skipped unexpectedly, check if your commit message contains `[skip ci]` or `[no ci]`. Remove these tags to run the pipeline.

### Debug Information

The workflows include extensive logging and debugging information:

**CI Pipeline:**
- Test results and coverage percentages
- Build verification status
- E2E test screenshots and logs
- Virtual display setup and Chrome installation status
- Artifact upload and download status

**Auto Fix CI:**
- Workflow run analysis and failure identification
- Fix branch creation and verification process
- PR comment generation status
- Verification branch CI results
- Workflow run ID validation

**Auto Update Docs:**
- PR change analysis and incremental diff detection
- Documentation update progress
- Draft PR creation status
- CI-triggered change detection
- File significance analysis

**Store Coverage Enforcer:**
- Coverage percentages and gap analysis
- Uncovered code identification
- Test generation progress and PR creation status
- Change detection for src/ folder
- Coverage artifact verification
- Node.js analysis tool results

## Best Practices

1. **Review Generated Content**: Always review automatically generated tests, documentation updates, and fixes before merging.

2. **Monitor Coverage Trends**: Use the coverage reports to track coverage improvements over time.

3. **Maintain Quality Standards**: Ensure generated tests and documentation follow the same quality standards as manual work.

4. **Regular Cleanup**: Periodically clean up old coverage improvement branches, docs branches, and fix branches.

5. **Monitor Workflow Dependencies**: Understand how workflows trigger each other to avoid circular dependencies.

6. **Test AI-Generated Changes**: Verify that AI-generated fixes and tests actually resolve the issues they're meant to address.

7. **Use Issue Templates**: Encourage users to use the AI-first approach in issue templates before creating issues.

8. **Verify CI Fixes**: Always check that Auto Fix CI verification branches pass before accepting fixes.

9. **Monitor Artifact Retention**: Be aware that artifacts are retained for 1 day - download important reports promptly.

10. **Understand Smart Filtering**: Learn which branch patterns trigger or skip workflows to avoid confusion.

11. **Check Workflow Logs**: Use extensive logging to debug workflow issues and understand execution flow.

12. **Maintain API Keys**: Keep CURSOR_API_KEY and GEMINI_API_KEY secrets up to date for AI-powered features.

13. **Monitor Self-Triggering Prevention**: Be aware that workflows exclude cursoragent runs to prevent loops.

14. **Use Manual Triggers**: Leverage workflow_dispatch for testing and debugging specific workflow runs.

15. **Use Skip Patterns**: Use `[skip ci]` or `[no ci]` in commit messages for documentation updates, minor fixes, or work-in-progress commits to avoid unnecessary CI runs.

## Future Enhancements

Potential improvements to consider:
- Integration with code quality tools (ESLint, Prettier)
- Custom coverage thresholds per file or component
- Integration with project management tools (Jira, Linear)
- Enhanced test generation with more sophisticated AI prompts
- Support for multiple AI models in workflows
- Advanced change detection with semantic analysis
- Integration with security scanning tools
- Custom notification systems for workflow status
- Enhanced artifact management and retention policies
- Support for parallel workflow execution optimization