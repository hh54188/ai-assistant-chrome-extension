#!/usr/bin/env node

/**
 * Analyze Uncovered Code for 100% Coverage Script
 * 
 * This script analyzes uncovered code paths to identify specific lines,
 * functions, and branches that need additional test coverage.
 * 
 * Outputs:
 * - has-uncovered-code: 'true' or 'false'
 * - uncovered-lines: JSON array of uncovered lines
 * - uncovered-functions: JSON array of uncovered functions
 * - uncovered-branches: JSON array of uncovered branches
 * - test-suggestions: JSON array of test generation suggestions
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseLcovFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Coverage file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const fileCoverage = {};
  let currentFile = null;
  let currentFunction = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3);
      fileCoverage[currentFile] = {
        lines: {},
        functions: {},
        branches: {}
      };
    } else if (line.startsWith('FN:')) {
      // Function definition: FN:line_number,function_name
      const parts = line.substring(3).split(',');
      if (parts.length === 2) {
        const lineNum = parseInt(parts[0]);
        const funcName = parts[1];
        if (currentFile) {
          fileCoverage[currentFile].functions[funcName] = {
            line: lineNum,
            hits: 0,
            covered: false
          };
        }
      }
    } else if (line.startsWith('FNDA:')) {
      // Function data: FNDA:hits,function_name
      const parts = line.substring(5).split(',');
      if (parts.length === 2) {
        const hits = parseInt(parts[0]);
        const funcName = parts[1];
        if (currentFile && fileCoverage[currentFile].functions[funcName]) {
          fileCoverage[currentFile].functions[funcName].hits = hits;
          fileCoverage[currentFile].functions[funcName].covered = hits > 0;
        }
      }
    } else if (line.startsWith('DA:')) {
      // Line data: DA:line_number,hits
      const parts = line.substring(3).split(',');
      if (parts.length >= 2) {
        const lineNum = parseInt(parts[0]);
        const hits = parseInt(parts[1]);
        if (currentFile) {
          fileCoverage[currentFile].lines[lineNum] = {
            hits,
            covered: hits > 0
          };
        }
      }
    } else if (line.startsWith('BRDA:')) {
      // Branch data: BRDA:line_number,block_number,branch_number,taken
      const parts = line.substring(5).split(',');
      if (parts.length >= 4) {
        const lineNum = parseInt(parts[0]);
        const blockNum = parts[1];
        const branchNum = parts[2];
        const taken = parts[3] === '-' ? 0 : parseInt(parts[3]);
        if (currentFile) {
          const branchKey = `${lineNum}-${blockNum}-${branchNum}`;
          fileCoverage[currentFile].branches[branchKey] = {
            line: lineNum,
            block: blockNum,
            branch: branchNum,
            taken,
            covered: taken > 0
          };
        }
      }
    }
  }
  
  return fileCoverage;
}

function analyzeUncoveredCode(coverageData) {
  const uncoveredLines = [];
  const uncoveredFunctions = [];
  const uncoveredBranches = [];
  const testSuggestions = [];
  
  for (const [filePath, fileData] of Object.entries(coverageData)) {
    // Analyze uncovered lines
    for (const [lineNum, lineData] of Object.entries(fileData.lines)) {
      if (!lineData.covered) {
        uncoveredLines.push({
          file: filePath,
          line: parseInt(lineNum),
          hits: lineData.hits,
          type: 'line'
        });
      }
    }
    
    // Analyze uncovered functions
    for (const [funcName, funcData] of Object.entries(fileData.functions)) {
      if (!funcData.covered) {
        uncoveredFunctions.push({
          file: filePath,
          function: funcName,
          line: funcData.line,
          hits: funcData.hits,
          type: 'function'
        });
      }
    }
    
    // Analyze uncovered branches
    for (const [branchKey, branchData] of Object.entries(fileData.branches)) {
      if (!branchData.covered) {
        uncoveredBranches.push({
          file: filePath,
          line: branchData.line,
          block: branchData.block,
          branch: branchData.branch,
          taken: branchData.taken,
          type: 'branch'
        });
      }
    }
  }
  
  // Generate test suggestions based on uncovered code
  const fileGroups = {};
  
  // Group uncovered items by file
  [...uncoveredLines, ...uncoveredFunctions, ...uncoveredBranches].forEach(item => {
    if (!fileGroups[item.file]) {
      fileGroups[item.file] = {
        lines: [],
        functions: [],
        branches: []
      };
    }
    
    if (item.type === 'line') {
      fileGroups[item.file].lines.push(item);
    } else if (item.type === 'function') {
      fileGroups[item.file].functions.push(item);
    } else if (item.type === 'branch') {
      fileGroups[item.file].branches.push(item);
    }
  });
  
  // Create test suggestions for each file
  for (const [filePath, items] of Object.entries(fileGroups)) {
    const fileName = path.basename(filePath, '.js');
    const testFileName = `${fileName}.test.js`;
    const testFilePath = path.join(path.dirname(filePath), 'tests', testFileName);
    
    const suggestion = {
      file: filePath,
      testFile: testFilePath,
      priority: 'high',
      uncoveredItems: {
        lines: items.lines.length,
        functions: items.functions.length,
        branches: items.branches.length
      },
      suggestions: []
    };
    
    // Add specific suggestions for uncovered functions
    items.functions.forEach(func => {
      suggestion.suggestions.push({
        type: 'function',
        name: func.function,
        line: func.line,
        description: `Add test for function '${func.function}' at line ${func.line}`,
        example: generateFunctionTestExample(func.function, fileName)
      });
    });
    
    // Add suggestions for uncovered branches
    items.branches.forEach(branch => {
      suggestion.suggestions.push({
        type: 'branch',
        line: branch.line,
        description: `Add test for branch condition at line ${branch.line}`,
        example: generateBranchTestExample(branch.line, fileName)
      });
    });
    
    // Add suggestions for uncovered lines
    if (items.lines.length > 0) {
      suggestion.suggestions.push({
        type: 'lines',
        count: items.lines.length,
        description: `Add tests to cover ${items.lines.length} uncovered lines`,
        example: generateLineTestExample(fileName)
      });
    }
    
    testSuggestions.push(suggestion);
  }
  
  return {
    uncoveredLines,
    uncoveredFunctions,
    uncoveredBranches,
    testSuggestions
  };
}

function generateFunctionTestExample(funcName, storeName) {
  return `// Test for function: ${funcName}
test('should test ${funcName}', () => {
  // TODO: Add test implementation
  // Example:
  // const store = use${storeName}Store();
  // const result = store.${funcName}();
  // expect(result).toBeDefined();
});`;
}

function generateBranchTestExample(lineNum, storeName) {
  return `// Test for branch condition at line ${lineNum}
test('should test branch condition at line ${lineNum}', () => {
  // TODO: Add test implementation
  // Example:
  // const store = use${storeName}Store();
  // Test both true and false conditions
  // expect(/* condition result */).toBe(true);
  // expect(/* condition result */).toBe(false);
});`;
}

function generateLineTestExample(storeName) {
  return `// Test for uncovered lines
test('should cover all lines', () => {
  // TODO: Add comprehensive test implementation
  // Example:
  // const store = use${storeName}Store();
  // Test all code paths to achieve 100% coverage
});`;
}

function calculateCoverageGaps(uncoveredData) {
  const totalUncovered = 
    uncoveredData.uncoveredLines.length + 
    uncoveredData.uncoveredFunctions.length + 
    uncoveredData.uncoveredBranches.length;
  
  return {
    totalUncovered,
    linesUncovered: uncoveredData.uncoveredLines.length,
    functionsUncovered: uncoveredData.uncoveredFunctions.length,
    branchesUncovered: uncoveredData.uncoveredBranches.length,
    filesNeedingTests: uncoveredData.testSuggestions.length
  };
}

function main() {
  try {
    log('🧪 Analyzing uncovered code for 100% coverage...', 'blue');
    
    // Load coverage analysis from previous step
    if (!fs.existsSync('./coverage-analysis.json')) {
      throw new Error('Coverage analysis file not found. Run analyze-coverage-data.js first.');
    }
    
    const coverageAnalysis = JSON.parse(fs.readFileSync('./coverage-analysis.json', 'utf8'));
    
    if (!coverageAnalysis.isBelow100) {
      log('✅ Coverage is already at 100%. No uncovered code found.', 'green');
      console.log('::set-output name=has-uncovered-code::false');
      return;
    }
    
    // Find lcov.info file
    const lcovFile = './coverage/lcov.info';
    if (!fs.existsSync(lcovFile)) {
      const alternativePaths = [
        './coverage/chrome-extension/coverage/lcov.info',
        './chrome-extension/coverage/lcov.info',
        './coverage/coverage/lcov.info'
      ];
      
      let found = false;
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          lcovFile = altPath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error('No lcov.info file found');
      }
    }
    
    log(`📊 Parsing detailed coverage data: ${lcovFile}`, 'blue');
    
    // Parse detailed coverage data
    const coverageData = parseLcovFile(lcovFile);
    
    // Analyze uncovered code
    const uncoveredData = analyzeUncoveredCode(coverageData);
    
    // Calculate coverage gaps
    const gaps = calculateCoverageGaps(uncoveredData);
    
    // Display analysis results
    log('\n📊 Uncovered Code Analysis:', 'bold');
    log(`  📄 Files needing tests: ${gaps.filesNeedingTests}`, 'yellow');
    log(`  📝 Uncovered lines: ${gaps.linesUncovered}`, 'yellow');
    log(`  🔧 Uncovered functions: ${gaps.functionsUncovered}`, 'yellow');
    log(`  🌿 Uncovered branches: ${gaps.branchesUncovered}`, 'yellow');
    log(`  📊 Total uncovered items: ${gaps.totalUncovered}`, 'yellow');
    
    // Display test suggestions
    if (uncoveredData.testSuggestions.length > 0) {
      log('\n💡 Test Generation Suggestions:', 'cyan');
      uncoveredData.testSuggestions.forEach((suggestion, index) => {
        log(`\n  ${index + 1}. ${path.basename(suggestion.file)}`, 'cyan');
        log(`     Test file: ${suggestion.testFile}`, 'cyan');
        log(`     Priority: ${suggestion.priority}`, 'cyan');
        log(`     Uncovered: ${suggestion.uncoveredItems.lines} lines, ${suggestion.uncoveredItems.functions} functions, ${suggestion.uncoveredItems.branches} branches`, 'cyan');
        
        suggestion.suggestions.forEach(sug => {
          log(`     - ${sug.description}`, 'cyan');
        });
      });
    }
    
    // Save test suggestions
    fs.writeFileSync('./test-suggestions.json', JSON.stringify(uncoveredData.testSuggestions, null, 2));
    
    // Set GitHub Actions outputs
    const hasUncoveredCode = gaps.totalUncovered > 0;
    const outputs = {
      'has-uncovered-code': hasUncoveredCode,
      'uncovered-lines': JSON.stringify(uncoveredData.uncoveredLines),
      'uncovered-functions': JSON.stringify(uncoveredData.uncoveredFunctions),
      'uncovered-branches': JSON.stringify(uncoveredData.uncoveredBranches),
      'test-suggestions': JSON.stringify(uncoveredData.testSuggestions)
    };
    
    // Write outputs to file for GitHub Actions
    const outputsFile = process.env.GITHUB_OUTPUT || '/tmp/github_output';
    const outputContent = Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(outputsFile, outputContent);
    
    // Also output to console for compatibility
    Object.entries(outputs).forEach(([key, value]) => {
      console.log(`::set-output name=${key}::${value}`);
    });
    
    if (hasUncoveredCode) {
      log('\n⚠️  Found uncovered code. Test generation is needed.', 'yellow');
    } else {
      log('\n✅ No uncovered code found. Coverage is complete.', 'green');
    }
    
  } catch (error) {
    log(`❌ Error analyzing uncovered code: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  parseLcovFile,
  analyzeUncoveredCode,
  calculateCoverageGaps
};