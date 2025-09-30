const fs = require('fs');
const path = require('path');

function findUncoveredCode() {
  const lcovPath = path.resolve(__dirname, '../coverage/lcov.info');
  if (!fs.existsSync(lcovPath)) {
    console.log('No coverage file found at', lcovPath);
    return [];
  }

  const lcovContent = fs.readFileSync(lcovPath, 'utf8');
  const uncovered = [];

  let currentFile = '';
  const lines = lcovContent.split('\n');

  for (const line of lines) {
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3).trim();
    } else if (line.startsWith('DA:') && line.includes(',0')) {
      const parts = line.substring(3).split(',');
      const lineNumber = parseInt(parts[0], 10);
      uncovered.push({ file: currentFile, line: lineNumber });
    }
  }

  return uncovered;
}

function getCodeContext(filePath, uncoveredLines) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const context = {};
  uncoveredLines.forEach((lineNum) => {
    const start = Math.max(0, lineNum - 3);
    const end = Math.min(lines.length, lineNum + 3);
    context[lineNum] = {
      lineNumber: lineNum,
      code: lines[lineNum - 1] || '',
      context: lines.slice(start, end).map((line, idx) => ({
        lineNumber: start + idx + 1,
        code: line,
        isTarget: start + idx + 1 === lineNum,
      })),
    };
  });

  return { filePath, content, context };
}

function generateUncoveredAnalysis(uncovered) {
  const analysis = [];

  const byFile = {};
  uncovered.forEach((item) => {
    if (!byFile[item.file]) {
      byFile[item.file] = [];
    }
    byFile[item.file].push(item.line);
  });

  Object.keys(byFile).forEach((file) => {
    if (file.includes('src/stores/') && file.endsWith('.js')) {
      const lines = byFile[file].sort((a, b) => a - b);
      const codeContext = getCodeContext(file, lines);
      if (codeContext) {
        analysis.push({
          sourceFile: file,
          testFile: file
            .replace('src/stores/', 'src/tests/stores/')
            .replace('.js', '.test.js'),
          uncoveredLines: lines,
          codeContext,
          totalUncoveredLines: lines.length,
        });
      }
    }
  });

  return analysis;
}

function generateNaturalLanguageDescription(analysis) {
  let description = '# Uncovered Code Analysis for 100% Test Coverage\n\n';
  description +=
    'The following files have uncovered code that needs tests to reach 100% coverage:\n\n';

  analysis.forEach((item) => {
    description += `## ${item.sourceFile}\n`;
    description += `- **Test file**: \`${item.testFile}\`\n`;
    description += `- **Uncovered lines**: ${item.uncoveredLines.join(', ')}\n`;
    description += `- **Total uncovered lines**: ${item.totalUncoveredLines}\n\n`;

    description += '### Code context for uncovered lines:\n';
    Object.entries(item.codeContext.context).forEach(([lineNum, ctx]) => {
      description += `- **Line ${lineNum}**: \`${ctx.code.trim()}\`\n`;
    });
    description += '\n';
  });

  return description;
}

function main() {
  const uncovered = findUncoveredCode();
  const analysis = generateUncoveredAnalysis(uncovered);
  const description = generateNaturalLanguageDescription(analysis);

  console.log('Uncovered code found:', uncovered.length, 'lines');
  console.log('Files needing tests:', analysis.length);

  fs.writeFileSync('uncovered-analysis.json', JSON.stringify(analysis, null, 2));
  fs.writeFileSync('uncovered-description.md', description);

  console.log(
    'Analysis written to uncovered-analysis.json and uncovered-description.md'
  );
}

if (require.main === module) {
  main();
}
