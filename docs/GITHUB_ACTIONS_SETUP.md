# GitHub Actions Setup

This document describes the GitHub Actions workflows configured for this project.

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

### 2. Auto Fix CI (`.github/workflows/auto-fix-ci.yml`)
Automatically attempts to fix CI failures by creating fix branches and PRs.

**Trigger:** Runs after CI Pipeline completes with failure status
**Features:**
- Uses Cursor AI to analyze and fix CI failures
- Creates persistent fix branches
- Generates PR comments with compare links

### 3. Store Coverage Enforcer (`.github/workflows/coverage-enforcer.yml`)
**NEW WORKFLOW** - Automatically ensures store test coverage reaches 100%.

**Trigger:** Runs after CI Pipeline completes successfully
**Features:**
- Downloads and analyzes coverage artifacts from CI Pipeline
- Parses lcov.info coverage data
- Identifies uncovered code paths
- Generates additional tests automatically
- Creates pull requests with test improvements
- Prevents duplicate PRs for the same coverage issue

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

The workflow requires the following GitHub permissions:
- `contents: write` - To create branches and commits
- `pull-requests: write` - To create and manage PRs
- `actions: write` - To trigger workflows
- `checks: write` - To create check runs
- `issues: write` - To create tracking issues

### Environment Variables

Required secrets:
- `CURSOR_API_KEY` - For AI-powered test generation
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Setup Instructions

### 1. Enable GitHub Actions
GitHub Actions are enabled by default when the workflow files are present in `.github/workflows/`.

### 2. Configure Secrets
Add the following secrets in your repository settings:
- `CURSOR_API_KEY`: Your Cursor API key for AI test generation
- `GEMINI_API_KEY`: Your Gemini API key for E2E tests

### 3. Verify Workflow Triggers
The workflows are configured to trigger on:
- Push to master branch
- Pull requests to master branch
- Workflow completion events

### 4. Monitor Workflow Runs
You can monitor workflow runs in the GitHub Actions tab of your repository.

## Troubleshooting

### Common Issues

1. **Coverage Not Generated**: Ensure the CI Pipeline is running the coverage step and uploading artifacts.

2. **Permission Errors**: Verify that the GitHub token has the required permissions.

3. **Test Generation Fails**: Check that the CURSOR_API_KEY secret is properly configured.

4. **Duplicate PRs**: The workflow prevents duplicate coverage PRs by checking for existing open PRs.

### Debug Information

The workflow includes extensive logging and debugging information:
- Coverage percentages are logged at each step
- Test generation progress is tracked
- PR creation status is reported

## Best Practices

1. **Review Generated Tests**: Always review automatically generated tests before merging.

2. **Monitor Coverage Trends**: Use the coverage reports to track coverage improvements over time.

3. **Maintain Test Quality**: Ensure generated tests follow the same quality standards as manual tests.

4. **Regular Cleanup**: Periodically clean up old coverage improvement branches and PRs.

## Future Enhancements

Potential improvements to consider:
- Integration with code quality tools
- Custom coverage thresholds per file
- Integration with project management tools
- Enhanced test generation with more sophisticated AI prompts