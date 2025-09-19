# Store Coverage Enforcer Workflow

## Overview

The Store Coverage Enforcer is a GitHub Actions workflow that automatically ensures store test coverage reaches 100%. It monitors the CI Pipeline, analyzes coverage data, and creates pull requests with additional tests when coverage is insufficient.

## Features

### 🎯 Automatic Coverage Monitoring
- Monitors CI Pipeline completion
- Downloads and parses coverage artifacts
- Analyzes lcov.info coverage data
- Tracks lines, functions, and branches coverage

### 🤖 Intelligent Test Generation
- Identifies uncovered code paths
- Generates additional test files automatically
- Uses AI assistance for test creation
- Ensures all generated tests pass

### 📋 Smart PR Management
- Creates pull requests only when needed
- Prevents duplicate coverage PRs
- Updates existing PRs with coverage status
- Includes detailed coverage reports

### ✅ Quality Assurance
- Verifies tests pass before creating PRs
- Ensures no breaking changes
- Maintains code quality standards
- Provides comprehensive test coverage

## How It Works

### 1. Trigger
The workflow triggers automatically when:
- CI Pipeline completes successfully
- Coverage artifacts are available
- Store test coverage is below 100%

### 2. Coverage Analysis
```yaml
- Parses lcov.info coverage data
- Extracts coverage percentages (lines, functions, branches)
- Identifies specific uncovered lines
- Generates detailed coverage reports
```

### 3. Test Generation
```yaml
- Analyzes uncovered code paths
- Creates test templates for missing coverage
- Generates actual test implementations
- Validates test functionality
```

### 4. PR Creation
```yaml
- Creates new branch for coverage improvements
- Commits generated tests
- Creates pull request with detailed description
- Includes coverage improvement metrics
```

## Configuration

### Workflow File
Located at: `.github/workflows/coverage-enforcer.yml`

### Required Secrets
- `CURSOR_API_KEY`: For AI-powered test generation
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Coverage Configuration
The workflow uses the existing coverage setup:
```json
{
  "scripts": {
    "test:stores:coverage": "vitest --coverage --run src/tests/stores/ --coverage.include='src/stores/**/*Store.js'"
  }
}
```

## Coverage Requirements

The workflow enforces 100% coverage for:
- **Lines**: All executable lines must be covered
- **Functions**: All functions must be called in tests  
- **Branches**: All conditional branches must be tested

## Example Workflow Run

### Successful Coverage (100%)
```
🎉 Store test coverage is at 100%!
No action needed - all tests are fully covered.
```

### Insufficient Coverage
```
📊 Coverage Update
Current store test coverage status:
- Lines: 85%
- Functions: 92%
- Branches: 78%

⚠️ Coverage is still below 100%. Additional tests may be needed.
```

### Generated PR
```markdown
## Coverage Improvement

This PR automatically improves store test coverage to reach 100%.

### Current Coverage Status
- **Lines**: 85% → 100%
- **Functions**: 92% → 100%  
- **Branches**: 78% → 100%

### Changes Made
- Added additional unit tests for uncovered code paths
- Generated tests based on coverage analysis
- Ensured all tests pass before creating this PR
```

## Generated Artifacts

The workflow creates several artifacts:
- `coverage-analysis-report`: Detailed coverage analysis
- `test-suggestions.json`: Test generation suggestions
- Coverage reports in HTML and LCOV formats

## Best Practices

### For Developers
1. **Review Generated Tests**: Always review automatically generated tests before merging
2. **Maintain Test Quality**: Ensure generated tests follow project standards
3. **Monitor Coverage Trends**: Track coverage improvements over time

### For Maintainers
1. **Monitor Workflow Runs**: Check GitHub Actions tab for workflow status
2. **Review PRs**: Ensure generated tests are appropriate
3. **Update Configuration**: Adjust coverage requirements as needed

## Troubleshooting

### Common Issues

**Coverage Not Generated**
- Verify CI Pipeline runs coverage step
- Check that artifacts are uploaded correctly
- Ensure vitest configuration is correct

**Permission Errors**
- Verify GitHub token has required permissions
- Check repository settings for Actions permissions

**Test Generation Fails**
- Ensure CURSOR_API_KEY is properly configured
- Check API key has sufficient credits
- Verify network connectivity

**Duplicate PRs**
- The workflow prevents duplicate coverage PRs automatically
- Check for existing open PRs with "coverage" label

### Debug Information

The workflow includes extensive logging:
- Coverage percentages at each step
- Test generation progress tracking
- PR creation status reporting
- Error handling and recovery

## Integration with Existing Workflows

### CI Pipeline Integration
- Downloads artifacts from CI Pipeline
- Uses existing coverage configuration
- Leverages existing test infrastructure

### Auto Fix CI Integration
- Works alongside auto-fix workflow
- Different triggers and purposes
- Complementary functionality

## Future Enhancements

Potential improvements:
- Custom coverage thresholds per file
- Integration with code quality tools
- Enhanced test generation algorithms
- Project management tool integration
- Custom coverage reporting formats

## Monitoring and Metrics

### Key Metrics
- Coverage improvement percentage
- Number of tests generated
- Time to reach 100% coverage
- PR creation and merge rates

### Reporting
- Coverage trends over time
- Test generation effectiveness
- Workflow performance metrics
- Quality of generated tests

## Security Considerations

### Permissions
The workflow requires minimal permissions:
- `contents: write` - Create branches and commits
- `pull-requests: write` - Create and manage PRs
- `actions: write` - Trigger workflows
- `checks: write` - Create check runs

### API Keys
- CURSOR_API_KEY is used securely via GitHub Secrets
- No sensitive data is logged or exposed
- All API calls are made from secure GitHub Actions environment

## Support

For issues or questions:
1. Check the GitHub Actions logs
2. Review the workflow configuration
3. Verify required secrets are set
4. Check coverage configuration in package.json
5. Review vitest configuration

## Related Documentation

- [GitHub Actions Setup Guide](../GITHUB_ACTIONS_SETUP.md)
- [Chrome Extension Tests](../extension/CHROME_EXTENSION_TESTS_README.md)
- [Technical Documentation](../TECHNICAL.md)
