const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read lcov.info to find uncovered lines
function findUncoveredCode() {
  const lcovPath = 'coverage/lcov.info';
  if (!fs.existsSync(lcovPath)) {
    console.log('No coverage file found');
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
      const lineNumber = parseInt(parts[0]);
      uncovered.push({
        file: currentFile,
        line: lineNumber
      });
    }
  }
  
  return uncovered;
}

// Get the actual code content around uncovered lines
function getCodeContext(filePath, uncoveredLines) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const context = {};
  uncoveredLines.forEach(lineNum => {
    const start = Math.max(0, lineNum - 5);
    const end = Math.min(lines.length, lineNum + 5);
    context[lineNum] = lines.slice(start, end).join('\n');
  });
  
  return {
    filePath,
    content,
    context
  };
}

// Generate AI prompt for test generation
function createAIPrompt(storeFile, uncoveredLines, codeContext) {
  const contextText = Object.entries(codeContext.context)
    .map(([line, context]) => `Line ${line}:\n${context}`)
    .join('\n\n');
  
  return `You are an expert JavaScript/React testing engineer. I need you to generate comprehensive unit tests for a Zustand store that has uncovered code paths.

STORE FILE: ${storeFile}
UNCOVERED LINES: ${uncoveredLines.join(', ')}

CODE CONTEXT:
${contextText}

FULL STORE CODE:
${codeContext.content}

REQUIREMENTS:
1. Generate complete, working unit tests using Vitest and @testing-library/react
2. Cover ALL the uncovered lines mentioned above
3. Use proper mocking for external dependencies
4. Test both happy path and edge cases
5. Ensure tests are realistic and meaningful
6. Use the existing test patterns from the project
7. Import statements should be correct relative to the test file location
8. Tests should be well-documented with descriptive names

EXISTING TEST PATTERNS IN PROJECT:
- Use describe blocks for grouping related tests
- Use it or test for individual test cases
- Use beforeEach for setup
- Use vi.fn() for mocking functions
- Use renderHook from @testing-library/react for testing hooks
- Use act for state updates
- Use expect for assertions

Please generate a complete test file that covers all uncovered lines. The test file should be production-ready and follow best practices.`;
}

// Call Cursor API to generate tests
async function generateTestsWithAI(storeFile, uncoveredLines, codeContext) {
  const prompt = createAIPrompt(storeFile, uncoveredLines, codeContext);
  
  try {
    console.log(`Calling Cursor API for ${storeFile}...`);
    
    const response = await axios.post('https://api.cursor.sh/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert JavaScript/React testing engineer specializing in Zustand stores and Vitest testing framework.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CURSOR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error calling Cursor API for ${storeFile}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  const uncovered = findUncoveredCode();
  console.log('Uncovered code found:', uncovered.length, 'lines');
  
  // Group by file
  const byFile = {};
  uncovered.forEach(item => {
    if (!byFile[item.file]) {
      byFile[item.file] = [];
    }
    byFile[item.file].push(item.line);
  });

  // Process each store file
  const results = [];
  for (const [file, lines] of Object.entries(byFile)) {
    if (file.includes('src/stores/') && file.endsWith('.js')) {
      console.log(`Processing ${file} with uncovered lines: ${lines.join(', ')}`);
      
      const codeContext = getCodeContext(file, lines);
      if (codeContext) {
        const testFile = file.replace('src/stores/', 'src/tests/stores/').replace('.js', '.test.js');
        
        // Check if test file already exists
        if (fs.existsSync(testFile)) {
          console.log(`Test file already exists: ${testFile}, skipping...`);
          continue;
        }
        
        const generatedTests = await generateTestsWithAI(file, lines, codeContext);
        
        if (generatedTests) {
          // Clean up the generated tests (remove markdown formatting if present)
          const cleanTests = generatedTests
            .replace(/```javascript\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/```js\n?/g, '')
            .trim();
          
          // Ensure proper directory structure
          const testDir = path.dirname(testFile);
          if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
          }
          
          fs.writeFileSync(testFile, cleanTests);
          console.log(`✅ Generated tests for ${file} -> ${testFile}`);
          
          results.push({
            storeFile: file,
            testFile: testFile,
            uncoveredLines: lines,
            success: true
          });
        } else {
          console.log(`❌ Failed to generate tests for ${file}`);
          results.push({
            storeFile: file,
            testFile: testFile,
            uncoveredLines: lines,
            success: false
          });
        }
      }
    }
  }
  
  // Write results summary
  fs.writeFileSync('test-generation-results.json', JSON.stringify(results, null, 2));
  console.log('Test generation completed. Results:', results.length, 'files processed');
}

main().catch(console.error);
