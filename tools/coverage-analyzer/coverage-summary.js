const fs = require('fs');
const path = require('path');

/**
 * Coverage Summary Generator
 * Parses LCOV data and calculates coverage metrics for GitHub Actions
 */

function parseLcovData(lcovPath) {
  if (!fs.existsSync(lcovPath)) {
    console.error('❌ LCOV file not found:', lcovPath);
    return null;
  }

  const lcovContent = fs.readFileSync(lcovPath, 'utf8');
  
  // Initialize counters
  let linesFound = 0;
  let linesHit = 0;
  let functionsFound = 0;
  let functionsHit = 0;
  let branchesFound = 0;
  let branchesHit = 0;
  
  const lines = lcovContent.split('\n');
  
  // Parse each line and accumulate coverage data
  for (const line of lines) {
    if (line.startsWith('LF:')) {
      // Lines Found
      linesFound += parseInt(line.substring(3), 10);
    } else if (line.startsWith('LH:')) {
      // Lines Hit
      linesHit += parseInt(line.substring(3), 10);
    } else if (line.startsWith('FNF:')) {
      // Functions Found
      functionsFound += parseInt(line.substring(4), 10);
    } else if (line.startsWith('FNH:')) {
      // Functions Hit
      functionsHit += parseInt(line.substring(4), 10);
    } else if (line.startsWith('BRF:')) {
      // Branches Found
      branchesFound += parseInt(line.substring(4), 10);
    } else if (line.startsWith('BRH:')) {
      // Branches Hit
      branchesHit += parseInt(line.substring(4), 10);
    }
  }
  
  return {
    linesFound,
    linesHit,
    functionsFound,
    functionsHit,
    branchesFound,
    branchesHit
  };
}

function calculateCoveragePercentages(data) {
  const linesCovered = data.linesFound > 0 ? Math.round((data.linesHit * 100) / data.linesFound) : 0;
  const functionsCovered = data.functionsFound > 0 ? Math.round((data.functionsHit * 100) / data.functionsFound) : 0;
  const branchesCovered = data.branchesFound > 0 ? Math.round((data.branchesHit * 100) / data.branchesFound) : 0;
  
  return {
    linesCovered,
    functionsCovered,
    branchesCovered
  };
}

function determineCoverageStatus(percentages) {
  const isSufficient = percentages.linesCovered === 100 && 
                      percentages.functionsCovered === 100 && 
                      percentages.branchesCovered === 100;
  
  return {
    coverageAvailable: true,
    coverageSufficient: isSufficient
  };
}

function generateCoverageSummary(coveragePath) {
  console.log('🔍 Analyzing coverage data from:', coveragePath);
  
  // Check if coverage directory exists
  if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage directory not found:', coveragePath);
    return {
      coverageAvailable: false,
      coverageSufficient: false,
      linesCovered: 0,
      functionsCovered: 0,
      branchesCovered: 0,
      error: 'Coverage directory not found'
    };
  }
  
  // Check if lcov.info exists
  const lcovPath = path.join(coveragePath, 'lcov.info');
  if (!fs.existsSync(lcovPath)) {
    console.error('❌ lcov.info not found in:', coveragePath);
    return {
      coverageAvailable: false,
      coverageSufficient: false,
      linesCovered: 0,
      functionsCovered: 0,
      branchesCovered: 0,
      error: 'lcov.info not found'
    };
  }
  
  console.log('📊 Parsing lcov.info...');
  
  // Parse LCOV data
  const rawData = parseLcovData(lcovPath);
  if (!rawData) {
    return {
      coverageAvailable: false,
      coverageSufficient: false,
      linesCovered: 0,
      functionsCovered: 0,
      branchesCovered: 0,
      error: 'Failed to parse lcov.info'
    };
  }
  
  // Calculate percentages
  const percentages = calculateCoveragePercentages(rawData);
  
  // Determine status
  const status = determineCoverageStatus(percentages);
  
  // Log results
  console.log(`Lines: ${rawData.linesHit}/${rawData.linesFound} (${percentages.linesCovered}%)`);
  console.log(`Functions: ${rawData.functionsHit}/${rawData.functionsFound} (${percentages.functionsCovered}%)`);
  console.log(`Branches: ${rawData.branchesHit}/${rawData.branchesFound} (${percentages.branchesCovered}%)`);
  
  if (status.coverageSufficient) {
    console.log('✅ Coverage is sufficient at 100%');
  } else {
    console.log('⚠️ Coverage is insufficient - needs improvement');
  }
  
  return {
    coverageAvailable: status.coverageAvailable,
    coverageSufficient: status.coverageSufficient,
    linesCovered: percentages.linesCovered,
    functionsCovered: percentages.functionsCovered,
    branchesCovered: percentages.branchesCovered,
    rawData
  };
}

// Main execution
function main() {
  // Get coverage path from command line argument or use default
  const coveragePath = process.argv[2] || '../coverage';
  
  const summary = generateCoverageSummary(coveragePath);
  
  // Output results in a format that can be sourced by shell script
  console.log('# Coverage Summary Results');
  console.log(`COVERAGE_AVAILABLE=${summary.coverageAvailable}`);
  console.log(`COVERAGE_SUFFICIENT=${summary.coverageSufficient}`);
  console.log(`LINES_COVERED=${summary.linesCovered}`);
  console.log(`FUNCTIONS_COVERED=${summary.functionsCovered}`);
  console.log(`BRANCHES_COVERED=${summary.branchesCovered}`);
  
  // Exit with appropriate code
  if (!summary.coverageAvailable) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateCoverageSummary,
  parseLcovData,
  calculateCoveragePercentages,
  determineCoverageStatus
};
