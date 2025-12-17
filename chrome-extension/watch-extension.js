/* eslint-env node */
import { watch } from 'fs';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
let buildTimeout = null;
let extensionBuildProcess = null;
let lastBuildTime = 0;
let isRunningExtensionBuild = false;

// Files that Vite builds (we should watch for these)
const viteBuildFiles = ['main.js', 'sidebar.js', 'index.html'];

// Files/directories that build-extension.js copies (we should ignore changes to these)
const ignoredFiles = ['manifest.json', 'icons', 'content.js', 'sidebar.html'];

console.log('🚀 Starting development watch mode...\n');
console.log('📦 Starting Vite build in watch mode...\n');

// Start Vite build in watch mode
const viteProcess = spawn('npx', ['vite', 'build', '--watch'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

// Function to run build-extension.js
function runExtensionBuild() {
    if (extensionBuildProcess || isRunningExtensionBuild) {
        return; // Already running
    }

    isRunningExtensionBuild = true;
    console.log('🔧 Running extension build...');

    extensionBuildProcess = spawn('node', ['build-extension.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    extensionBuildProcess.on('close', (code) => {
        extensionBuildProcess = null;
        isRunningExtensionBuild = false;

        // Update lastBuildTime to ignore the changes we just made
        if (fs.existsSync(distDir)) {
            const currentMaxTime = checkDirectoryForViteFiles(distDir, 0);
            lastBuildTime = Math.max(lastBuildTime, currentMaxTime);
        }
    });
}

// Function to check directory for Vite build files only (not files we copy)
function checkDirectoryForViteFiles(dir, baseTime) {
    if (!fs.existsSync(dir)) {
        return baseTime;
    }

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let maxTime = baseTime;

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(distDir, fullPath);
            const fileName = entry.name;

            // Skip ignored files/directories
            if (ignoredFiles.some(ignored => relativePath.includes(ignored) || fileName === ignored)) {
                continue;
            }

            try {
                if (entry.isDirectory()) {
                    maxTime = Math.max(maxTime, checkDirectoryForViteFiles(fullPath, baseTime));
                } else if (entry.isFile()) {
                    // Only check Vite build files or chunk files
                    if (viteBuildFiles.includes(fileName) ||
                        fileName.startsWith('chunk-') ||
                        fileName.endsWith('.js') && !relativePath.includes('public')) {
                        const stats = fs.statSync(fullPath);
                        maxTime = Math.max(maxTime, stats.mtimeMs);
                    }
                }
            } catch (err) {
                // Ignore errors reading individual files
            }
        }

        return maxTime;
    } catch (err) {
        return baseTime;
    }
}

// Function to check if Vite build files have changed
function checkDistForViteChanges() {
    if (!fs.existsSync(distDir) || isRunningExtensionBuild) {
        return false;
    }

    const currentMaxTime = checkDirectoryForViteFiles(distDir, 0);
    if (currentMaxTime > lastBuildTime && currentMaxTime > 0) {
        lastBuildTime = currentMaxTime;
        return true;
    }

    return false;
}

// Wait for dist directory to be created, then start watching
function startWatching() {
    if (!fs.existsSync(distDir)) {
        setTimeout(startWatching, 500);
        return;
    }

    console.log('🔍 Watching for Vite build changes...\n');

    // Poll for changes to Vite build files only
    const pollInterval = setInterval(() => {
        if (checkDistForViteChanges()) {
            clearTimeout(buildTimeout);
            buildTimeout = setTimeout(() => {
                runExtensionBuild();
            }, 500);
        }
    }, 1000);

    // Also use fs.watch as backup (but filter for Vite files only)
    let watcher;
    try {
        watcher = watch(distDir, { recursive: true }, (eventType, filename) => {
            if (!filename || isRunningExtensionBuild) {
                return;
            }

            // Ignore temporary files
            if (filename.includes('.tmp') || filename.includes('~')) {
                return;
            }

            // Only react to Vite build files, ignore copied files
            const isViteFile = viteBuildFiles.some(file => filename.includes(file)) ||
                filename.startsWith('chunk-') ||
                (filename.endsWith('.js') && !ignoredFiles.some(ignored => filename.includes(ignored)));

            if (isViteFile && (eventType === 'change' || eventType === 'rename')) {
                // Update last build time
                try {
                    const filePath = path.join(distDir, filename);
                    if (fs.existsSync(filePath)) {
                        const stats = fs.statSync(filePath);
                        if (stats.mtimeMs > lastBuildTime) {
                            lastBuildTime = stats.mtimeMs;

                            // Debounce: wait a moment for build to complete
                            clearTimeout(buildTimeout);
                            buildTimeout = setTimeout(() => {
                                runExtensionBuild();
                            }, 500);
                        }
                    }
                } catch (err) {
                    // Ignore errors
                }
            }
        });
    } catch (err) {
        console.warn('⚠️  Could not set up file watcher, using polling only:', err.message);
    }

    // Handle process termination
    const cleanup = () => {
        console.log('\n🛑 Stopping watch...');
        clearInterval(pollInterval);
        if (watcher) watcher.close();
        if (viteProcess) viteProcess.kill();
        if (extensionBuildProcess) extensionBuildProcess.kill();
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

// Start watching after a short delay to let Vite initialize
setTimeout(() => {
    // Set initial build time to now
    lastBuildTime = Date.now();
    startWatching();
}, 2000);

// Handle vite process errors
viteProcess.on('error', (err) => {
    console.error('❌ Error starting Vite:', err);
    process.exit(1);
});

// Handle vite process exit
viteProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
        console.error(`❌ Vite process exited with code ${code}`);
    }
});
