# GitHub Actions Setup

This document describes the GitHub Actions workflows and issue templates configured for this project.

## Workflows Overview

### 1. CI Pipeline (`.github/workflows/ci-pipeline.yml`)
The main CI pipeline that runs on every push and pull request to the master branch.

**Features:**
- Unit tests for Chrome Extension components and stores
- E2E tests with Puppeteer
- Build verification
- Coverage reporting for store tests

**Jobs:**
- `unit-tests`: Runs component and store tests with coverage
- `e2e-tests`: Runs end-to-end tests with Chrome browser
- `build-verification`: Verifies the extension builds correctly

**Triggers:**
- Push to master branch
- Pull requests to master branch
- Manual workflow dispatch

### 2. Auto Fix CI (`.github/workflows/auto-fix-ci.yml`)
Automatically attempts to fix CI failures by creating fix branches and PRs.

**Trigger:** Runs after CI Pipeline completes with failure status
**Features:**
- Uses Cursor AI to analyze and fix CI failures
- Creates persistent fix branches with `ci-fix` prefix
- Generates PR comments with compare links
- Includes verification process with test branches
- Handles both PR-based and direct branch workflow runs

**Permissions:**
- `contents: write` - Push branches, create commits
- `pull-requests: write` - Comment on PRs
- `actions: write` - Trigger workflows on verification branch
- `checks: write` - Create/update check runs for verification status

### 3. Auto Update Docs (`.github/workflows/auto-update-docs.yml`)
Automatically updates documentation when PRs are merged.

**Trigger:** Runs when PRs are merged to master (excluding docs-only PRs)
**Features:**
- Uses Cursor AI to analyze PR changes
- Updates relevant documentation based on code changes
- Maintains persistent docs branches with `docs` prefix
- Creates draft PRs with documentation updates
- Prevents circular updates for docs-only changes

**Smart Filtering:**
- ✅ Runs: PR from `feature/new-auth` merged → Documentation auto-updated
- ✅ Runs: PR from `bugfix/login-issue` merged → Documentation auto-updated
- ❌ Skips: PR from `docs/api-update` → No auto-update (avoids circular updates)
- ❌ Skips: PR is closed without merging → No auto-update

### 4. Store Coverage Enforcer (`.github/workflows/coverage-enforcer.yml`)
Automatically ensures store test coverage reaches 100%.

**Trigger:** Runs after CI Pipeline completes successfully
**Features:**
- Downloads and analyzes coverage artifacts from CI Pipeline
- Parses lcov.info coverage data
- Identifies uncovered code paths
- Generates additional tests automatically using Cursor AI
- Creates pull requests with test improvements
- Prevents duplicate PRs for the same coverage issue
- Smart filtering: only runs when `src/` folder changes are detected

## GitHub Issue Templates

The project includes AI-assisted issue templates to encourage users to try AI solutions first before creating issues.

### Bug Report Template (`.github/ISSUE_TEMPLATE/bug_report.md`)
- **Title Prefix:** `[BUG]`
- **Labels:** `bug`
- **AI-First Approach:** Encourages users to try AI assistance before reporting
- **Sections:**
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
  - What feature would you like?
  - Why is this needed?
  - Any examples?

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

6. **Docs Update Not Running**: Verify the PR was merged (not just closed) and doesn't start with "docs/".

7. **Coverage Enforcer Skipped**: Check if changes were made to files in the `chrome-extension/src/` folder.

8. **E2E Tests Failing**: Verify GEMINI_API_KEY is configured and Chrome dependencies are properly installed.

### Debug Information

The workflows include extensive logging and debugging information:

**CI Pipeline:**
- Test results and coverage percentages
- Build verification status
- E2E test screenshots and logs

**Auto Fix CI:**
- Workflow run analysis and failure identification
- Fix branch creation and verification process
- PR comment generation status

**Auto Update Docs:**
- PR change analysis and incremental diff detection
- Documentation update progress
- Draft PR creation status

**Store Coverage Enforcer:**
- Coverage percentages and gap analysis
- Uncovered code identification
- Test generation progress and PR creation status

## Best Practices

1. **Review Generated Content**: Always review automatically generated tests, documentation updates, and fixes before merging.

2. **Monitor Coverage Trends**: Use the coverage reports to track coverage improvements over time.

3. **Maintain Quality Standards**: Ensure generated tests and documentation follow the same quality standards as manual work.

4. **Regular Cleanup**: Periodically clean up old coverage improvement branches, docs branches, and fix branches.

5. **Monitor Workflow Dependencies**: Understand how workflows trigger each other to avoid circular dependencies.

6. **Test AI-Generated Changes**: Verify that AI-generated fixes and tests actually resolve the issues they're meant to address.

7. **Use Issue Templates**: Encourage users to use the AI-first approach in issue templates before creating issues.

## Future Enhancements

Potential improvements to consider:
- Integration with code quality tools
- Custom coverage thresholds per file
- Integration with project management tools
- Enhanced test generation with more sophisticated AI prompts