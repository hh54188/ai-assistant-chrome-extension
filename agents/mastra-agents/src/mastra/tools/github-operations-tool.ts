import { createTool } from "@mastra/core/tools";
import { Octokit } from "@octokit/rest";
import { readFile, readdir, stat } from "fs/promises";
import { join, relative } from "path";
import { z } from "zod";
import 'dotenv/config'

const octokit = new Octokit({
    auth: process.env.GITHUB_API_KEY,
});

const REPO_OWNER = "hh54188";
const REPO_NAME = "horace-jekyll-theme-v1.2.0";
const BRANCH = "master";

// Helper function to resolve blog path
function resolveBlogPath(relativePath: string): string {
    const scriptDir = process.cwd();
    const blogDir = join(scriptDir, "blog");
    return join(blogDir, relativePath);
}

// Helper function to resolve path (absolute or relative to blog)
function resolvePath(path: string): string {
    if (path.startsWith("/") || path.match(/^[A-Za-z]:/)) {
        return path;
    }
    return resolveBlogPath(path);
}

// Helper function to get all files recursively
async function getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
        const entryPath = join(dirPath, entry);
        const entryStat = await stat(entryPath);
        
        if (entry.startsWith('.')) {
            continue;
        }
        
        if (entryStat.isDirectory()) {
            const subFiles = await getAllFiles(entryPath);
            files.push(...subFiles);
        } else {
            files.push(entryPath);
        }
    }
    
    return files;
}

export const createGithubFileTool = createTool({
    id: "create-github-file",
    description: "Creates a new file in the GitHub repository at https://github.com/hh54188/horace-jekyll-theme-v1.2.0 on the master branch.",
    inputSchema: z.object({
        file_content: z.string().describe("The content to write to the file"),
        file_path: z.string().describe("The path to the file within the repository (e.g., '_posts/new-post.md')"),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the operation was successful"),
        message: z.string().describe("Success or error message"),
        commit_sha: z.string().optional().describe("Commit SHA if successful"),
        commit_url: z.string().optional().describe("Commit URL if successful"),
        error: z.string().optional().describe("Error message if operation failed"),
    }),
    execute: async ({ context }) => {
        const { file_content, file_path } = context;
        try {
            const result = await octokit.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: file_path,
                message: `Create ${file_path}`,
                content: Buffer.from(file_content, 'utf-8').toString('base64'),
                branch: BRANCH
            });
            
            return {
                success: true,
                message: "File created successfully",
                commit_sha: result.data.commit.sha,
                commit_url: result.data.commit.html_url || ""
            };
        } catch (error: any) {
            console.error(`❌ Error creating GitHub file: ${error.message}`);
            return {
                success: false,
                message: `Failed to create file: ${error.message}`,
                error: error.message || "Failed to create file"
            };
        }
    }
});

export const createGithubImageTool = createTool({
    id: "create-github-image",
    description: "Uploads an image file from local filesystem to the GitHub repository at https://github.com/hh54188/horace-jekyll-theme-v1.2.0 on the master branch.",
    inputSchema: z.object({
        local_image_path: z.string().describe("The local file path to the image to upload (can be absolute or relative to blog folder)"),
        target_file_path: z.string().describe("The path to the image file within the repository (e.g., 'images/my-image.jpg')"),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the operation was successful"),
        message: z.string().describe("Success or error message"),
        commit_sha: z.string().optional().describe("Commit SHA if successful"),
        commit_url: z.string().optional().describe("Commit URL if successful"),
        error: z.string().optional().describe("Error message if operation failed"),
    }),
    execute: async ({ context }) => {
        const { local_image_path, target_file_path } = context;
        try {
            const imagePath = resolvePath(local_image_path);
            const imageBuffer = await readFile(imagePath);
            const imageBase64 = imageBuffer.toString('base64');
            
            const result = await octokit.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: target_file_path,
                message: `Create ${target_file_path}`,
                content: imageBase64,
                branch: BRANCH
            });
            
            return {
                success: true,
                message: "Image created successfully",
                commit_sha: result.data.commit.sha,
                commit_url: result.data.commit.html_url || ""
            };
        } catch (error: any) {
            console.error(`❌ Error creating GitHub image: ${error.message}`);
            return {
                success: false,
                message: `Failed to create image: ${error.message}`,
                error: error.message || "Failed to create image"
            };
        }
    }
});

export const uploadFolderToGithubTool = createTool({
    id: "upload-folder-to-github",
    description: "Uploads all files from a local folder to the GitHub repository at https://github.com/hh54188/horace-jekyll-theme-v1.2.0 on the master branch. The folder structure is preserved in the repository.",
    inputSchema: z.object({
        local_folder_path: z.string().describe("The local file path to the folder to upload (relative to blog folder)"),
        target_repo_path: z.string().describe("The base path within the repository where files will be uploaded (e.g., 'images'). Files will maintain their relative paths under this base path."),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the operation was successful"),
        message: z.string().describe("Success or error message"),
        files_uploaded: z.number().describe("Number of files successfully uploaded"),
        files_failed: z.number().describe("Number of files that failed to upload"),
        failed_files: z.array(z.string()).describe("List of file paths that failed to upload"),
    }),
    execute: async ({ context }) => {
        const { local_folder_path, target_repo_path } = context;
        try {
            const localPath = resolveBlogPath(local_folder_path);
            const folderStat = await stat(localPath);
            
            if (!folderStat.isDirectory()) {
                return {
                    success: false,
                    message: `Path is not a directory: ${local_folder_path}`,
                    files_uploaded: 0,
                    files_failed: 0,
                    failed_files: []
                };
            }
            
            const allFiles = await getAllFiles(localPath);
            let filesUploaded = 0;
            let filesFailed = 0;
            const failedFiles: string[] = [];
            
            for (const localFilePath of allFiles) {
                try {
                    const fileBuffer = await readFile(localFilePath);
                    const fileBase64 = fileBuffer.toString('base64');
                    const relativePath = relative(localPath, localFilePath).replace(/\\/g, '/');
                    const targetFilePath = `${target_repo_path}/${relativePath}`;
                    
                    await octokit.repos.createOrUpdateFileContents({
                        owner: REPO_OWNER,
                        repo: REPO_NAME,
                        path: targetFilePath,
                        message: `Upload ${targetFilePath}`,
                        content: fileBase64,
                        branch: BRANCH
                    });
                    
                    filesUploaded++;
                    console.log(`✓ Uploaded: ${targetFilePath}`);
                } catch (error: any) {
                    filesFailed++;
                    failedFiles.push(localFilePath);
                    console.error(`❌ Error uploading ${localFilePath}: ${error.message}`);
                }
            }
            
            return {
                success: true,
                message: `Folder uploaded successfully: ${filesUploaded} files uploaded, ${filesFailed} files failed`,
                files_uploaded: filesUploaded,
                files_failed: filesFailed,
                failed_files: failedFiles
            };
        } catch (error: any) {
            console.error(`❌ Error uploading folder to GitHub: ${error.message}`);
            return {
                success: false,
                message: `Failed to upload folder: ${error.message}`,
                files_uploaded: 0,
                files_failed: 0,
                failed_files: []
            };
        }
    }
});
