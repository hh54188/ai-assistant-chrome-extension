#!/usr/bin/env node

/**
 * Analyze Coverage Data Script
 * 
 * This script analyzes coverage data from lcov.info files to determine
 * current coverage percentages and identify if coverage is below 100%.
 * 
 * Outputs:
 * - coverage-below-100: 'true' or 'false'
 * - lines-coverage: percentage of lines covered
 * - functions-coverage: percentage of functions covered
 * - branches-coverage: percentage of branches covered
 * - coverage-summary: JSON summary of coverage data
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
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
  
  let totalLines = 0;
  let coveredLines = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  
  const fileCoverage = {};
  let currentFile = null;
  
  for (const line of lines) {
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3);
      fileCoverage[currentFile] = {
        lines: { total: 0, covered: 0 },
        functions: { total: 0, covered: 0 },
        branches: { total: 0, covered: 0 }
      };
    } else if (line.startsWith('LF:')) {
      const count = parseInt(line.substring(3));
      totalLines += count;
      if (currentFile) {
        fileCoverage[currentFile].lines.total = count;
      }
    } else if (line.startsWith('LH:')) {
      const count = parseInt(line.substring(3));
      coveredLines += count;
      if (currentFile) {
        fileCoverage[currentFile].lines.covered = count;
      }
    } else if (line.startsWith('FNF:')) {
      const count = parseInt(line.substring(4));
      totalFunctions += count;
      if (currentFile) {
        fileCoverage[currentFile].functions.total = count;
      }
    } else if (line.startsWith('FNH:')) {
      const count = parseInt(line.substring(4));
      coveredFunctions += count;
      if (currentFile) {
        fileCoverage[currentFile].functions.covered = count;
      }
    } else if (line.startsWith('BRF:')) {
      const count = parseInt(line.substring(4));
      totalBranches += count;
      if (currentFile) {
        fileCoverage[currentFile].branches.total = count;
      }
    } else if (line.startsWith('BRH:')) {
      const count = parseInt(line.substring(4));
      coveredBranches += count;
      if (currentFile) {
        fileCoverage[currentFile].branches.covered = count;
      }
    }
  }
  
  return {
    lines: { total: totalLines, covered: coveredLines },
    functions: { total: totalFunctions, covered: coveredFunctions },
    branches: { total: totalBranches, covered: coveredBranches },
    files: fileCoverage
  };
}

function calculateCoveragePercentage(covered, total) {
  if (total === 0) return 100;
  return Math.round((covered / total) * 100);
}

function findUncoveredFiles(coverageData) {
  const uncoveredFiles = [];
  
  for (const [filePath, fileData] of Object.entries(coverageData.files)) {
    const linesCoverage = calculateCoveragePercentage(fileData.lines.covered, fileData.lines.total);
    const functionsCoverage = calculateCoveragePercentage(fileData.functions.covered, fileData.functions.total);
    const branchesCoverage = calculateCoveragePercentage(fileData.branches.covered, fileData.branches.total);
    
    if (linesCoverage < 100 || functionsCoverage < 100 || branchesCoverage < 100) {
      uncoveredFiles.push({
        file: filePath,
        lines: { covered: fileData.lines.covered, total: fileData.lines.total, percentage: linesCoverage },
        functions: { covered: fileData.functions.covered, total: fileData.functions.total, percentage: functionsCoverage },
        branches: { covered: fileData.branches.covered, total: fileData.branches.total, percentage: branchesCoverage }
      });
    }
  }
  
  return uncoveredFiles;
}

function main() {
  try {
    log('🔍 Analyzing coverage data...', 'blue');
    
    // Look for lcov.info file in coverage directory
    const coverageDir = './coverage';
    const lcovFile = path.join(coverageDir, 'lcov.info');
    
    if (!fs.existsSync(lcovFile)) {
      // Try alternative locations
      const alternativePaths = [
        path.join(coverageDir, 'chrome-extension', 'coverage', 'lcov.info'),
        path.join('./chrome-extension', 'coverage', 'lcov.info'),
        path.join('./coverage', 'chrome-extension', 'coverage', 'lcov.info')
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
        throw new Error('No lcov.info file found in coverage directory');
      }
    }
    
    log(`📊 Parsing coverage file: ${lcovFile}`, 'blue');
    
    // Parse coverage data
    const coverageData = parseLcovFile(lcovFile);
    
    // Calculate overall coverage percentages
    const linesCoverage = calculateCoveragePercentage(coverageData.lines.covered, coverageData.lines.total);
    const functionsCoverage = calculateCoveragePercentage(coverageData.functions.covered, coverageData.functions.total);
    const branchesCoverage = calculateCoveragePercentage(coverageData.branches.covered, coverageData.branches.total);
    
    // Check if coverage is below 100%
    const isBelow100 = linesCoverage < 100 || functionsCoverage < 100 || branchesCoverage < 100;
    
    // Display coverage summary
    log('\n📊 Coverage Summary:', 'bold');
    log(`  Lines: ${linesCoverage}% (${coverageData.lines.covered}/${coverageData.lines.total})`, 
        linesCoverage === 100 ? 'green' : 'yellow');
    log(`  Functions: ${functionsCoverage}% (${coverageData.functions.covered}/${coverageData.functions.total})`, 
        functionsCoverage === 100 ? 'green' : 'yellow');
    log(`  Branches: ${branchesCoverage}% (${coverageData.branches.covered}/${coverageData.branches.total})`, 
        branchesCoverage === 100 ? 'green' : 'yellow');
    
    // Find uncovered files
    const uncoveredFiles = findUncoveredFiles(coverageData);
    
    if (uncoveredFiles.length > 0) {
      log(`\n⚠️  Found ${uncoveredFiles.length} files with incomplete coverage:`, 'yellow');
      uncoveredFiles.forEach(file => {
        log(`  📄 ${file.file}`, 'yellow');
        log(`    Lines: ${file.lines.percentage}% (${file.lines.covered}/${file.lines.total})`, 'yellow');
        log(`    Functions: ${file.functions.percentage}% (${file.functions.covered}/${file.functions.total})`, 'yellow');
        log(`    Branches: ${file.branches.percentage}% (${file.branches.covered}/${file.branches.total})`, 'yellow');
      });
    }
    
    // Create coverage summary
    const coverageSummary = {
      overall: {
        lines: { covered: coverageData.lines.covered, total: coverageData.lines.total, percentage: linesCoverage },
        functions: { covered: coverageData.functions.covered, total: coverageData.functions.total, percentage: functionsCoverage },
        branches: { covered: coverageData.branches.covered, total: coverageData.branches.total, percentage: branchesCoverage }
      },
      isBelow100,
      uncoveredFiles,
      timestamp: new Date().toISOString()
    };
    
    // Save coverage summary to file
    fs.writeFileSync('./coverage-analysis.json', JSON.stringify(coverageSummary, null, 2));
    
    // Set GitHub Actions outputs
    const outputs = {
      'coverage-below-100': isBelow100,
      'lines-coverage': linesCoverage,
      'functions-coverage': functionsCoverage,
      'branches-coverage': branchesCoverage,
      'coverage-summary': JSON.stringify(coverageSummary)
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
    
    if (isBelow100) {
      log('\n⚠️  Coverage is below 100%. Additional tests may be needed.', 'yellow');
    } else {
      log('\n🎉 Store test coverage is at 100%!', 'green');
      log('No action needed - all tests are fully covered.', 'green');
    }
    
  } catch (error) {
    log(`❌ Error analyzing coverage data: ${error.message}`, 'red');
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
  calculateCoveragePercentage,
  findUncoveredFiles
};