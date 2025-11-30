import { createTool } from "@mastra/core/tools";
import { readFile, writeFile, mkdir, readdir, unlink, rmdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { z } from "zod";

// Helper function to remove directory recursively
async function removeDirectory(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath);
    for (const entry of entries) {
        const entryPath = join(dirPath, entry);
        const entryStat = await stat(entryPath);
        if (entryStat.isDirectory()) {
            await removeDirectory(entryPath);
        } else {
            await unlink(entryPath);
        }
    }
    await rmdir(dirPath);
}

// Helper function to download image from URL
async function downloadImageFromUrl(url: string): Promise<{ buffer: Buffer; contentType: string | null }> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType };
}

// Helper function to get extension from Content-Type
function getExtensionFromContentType(contentType: string | null): string {
    if (!contentType) return '.jpg';
    
    const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp',
        'image/svg+xml': '.svg',
        'image/tiff': '.tiff',
        'image/x-icon': '.ico',
        'image/avif': '.avif'
    };
    
    const baseContentType = contentType.split(';')[0].trim().toLowerCase();
    return mimeToExt[baseContentType] || '.jpg';
}

// Helper function to get extension from URL
function getExtensionFromUrl(url: string): string {
    const urlPath = new URL(url).pathname;
    const urlExt = urlPath.substring(urlPath.lastIndexOf('.')).toLowerCase();
    const validImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico', '.avif'];
    return validImageExts.includes(urlExt) ? urlExt : '.jpg';
}

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

export const createFileTool = createTool({
    id: "create-file",
    description: "Creates a file in the blog folder. The file will be created relative to the blog directory structure.",
    inputSchema: z.object({
        file_name: z.string().describe("The name of the file to create (can include path relative to blog folder)"),
        file_content: z.string().describe("The content to write to the file"),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the file was created successfully"),
        file_path: z.string().describe("The full path to the created file"),
        error: z.string().optional().describe("Error message if file creation failed"),
    }),
    execute: async ({ context }) => {
        const { file_name, file_content } = context;
        try {
            const filePath = resolveBlogPath(file_name);
            await mkdir(dirname(filePath), { recursive: true });
            await writeFile(filePath, file_content, "utf-8");
            console.log(`✓ Created file: ${filePath}`);
            return { success: true, file_path: filePath };
        } catch (error: any) {
            console.error(`❌ Error creating file: ${error.message}`);
            return { success: false, file_path: "", error: error.message || "Failed to create file" };
        }
    }
});

export const createFolderTool = createTool({
    id: "create-folder",
    description: "Creates a folder in the blog directory structure. The folder will be created relative to the blog directory.",
    inputSchema: z.object({
        folder_name: z.string().describe("The name of the folder to create (can include path relative to blog folder)"),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the folder was created successfully"),
        folder_path: z.string().describe("The full path to the created folder"),
        error: z.string().optional().describe("Error message if folder creation failed"),
    }),
    execute: async ({ context }) => {
        const { folder_name } = context;
        try {
            const folderPath = resolveBlogPath(folder_name);
            await mkdir(folderPath, { recursive: true });
            console.log(`✓ Created folder: ${folderPath}`);
            return { success: true, folder_path: folderPath };
        } catch (error: any) {
            console.error(`❌ Error creating folder: ${error.message}`);
            return { success: false, folder_path: "", error: error.message || "Failed to create folder" };
        }
    }
});

export const insertContentAtBeginningTool = createTool({
    id: "insert-content-at-beginning",
    description: "Inserts new content at the beginning of the target file. Reads the existing content of the file, prepends the new content to it, and writes the combined content back to the file. If the file does not exist, it will be created with only the new content.",
    inputSchema: z.object({
        target_file_path: z.string().describe("The path to the target file where content will be inserted. Can be relative to blog folder or absolute path."),
        new_content: z.string().describe("The content to insert at the beginning of the file"),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the content was inserted successfully"),
        error: z.string().optional().describe("Error message if insertion failed"),
    }),
    execute: async ({ context }) => {
        const { target_file_path, new_content } = context;
        try {
            const filePath = resolvePath(target_file_path);
            await mkdir(dirname(filePath), { recursive: true });
            
            let existingContent = "";
            try {
                existingContent = await readFile(filePath, "utf-8");
            } catch {
                // File doesn't exist, that's okay
            }
            
            const combinedContent = new_content + existingContent;
            await writeFile(filePath, combinedContent, "utf-8");
            console.log(`✓ Inserted content at beginning of: ${filePath}`);
            return { success: true };
        } catch (error: any) {
            console.error(`❌ Error inserting content at beginning of file: ${error.message}`);
            return { success: false, error: error.message || "Failed to insert content" };
        }
    }
});

export const cleanupBlogFoldersTool = createTool({
    id: "cleanup-blog-folders",
    description: "Deletes all markdown files in the blog/_posts folder and all folders in the blog/images folder. Useful for cleaning up old blog posts and images before publishing new content.",
    inputSchema: z.object({}),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the cleanup was successful"),
        message: z.string().describe("Success or error message"),
        files_deleted: z.number().describe("Number of markdown files deleted"),
        folders_deleted: z.number().describe("Number of image folders deleted"),
    }),
    execute: async () => {
        try {
            const postsDir = process.env.BLOG_POSTS_DIR
            const imagesDir = process.env.BLOG_IMAGES_DIR

            if (!postsDir || !imagesDir) {
                throw new Error("'postsDir' or 'imageDir' not exist yet")
            }
            
            let filesDeleted = 0;
            let foldersDeleted = 0;
            
            // Delete all markdown files in blog/_posts
            try {
                const postsEntries = await readdir(postsDir);
                for (const entry of postsEntries) {
                    const entryPath = join(postsDir, entry);
                    const entryStat = await stat(entryPath);
                    if (entry.endsWith('.md') && entryStat.isFile()) {
                        await unlink(entryPath);
                        filesDeleted++;
                        console.log(`✓ Deleted: ${entryPath}`);
                    }
                }
            } catch (error: any) {
                if (error.code !== 'ENOENT') throw error;
            }
            
            // Delete all folders in blog/images
            try {
                const imagesEntries = await readdir(imagesDir);
                for (const entry of imagesEntries) {
                    const entryPath = join(imagesDir, entry);
                    const entryStat = await stat(entryPath);
                    if (entryStat.isDirectory()) {
                        await removeDirectory(entryPath);
                        foldersDeleted++;
                        console.log(`✓ Deleted folder: ${entryPath}`);
                    }
                }
            } catch (error: any) {
                if (error.code !== 'ENOENT') throw error;
            }
            
            return {
                success: true,
                message: "Cleanup completed successfully",
                files_deleted: filesDeleted,
                folders_deleted: foldersDeleted
            };
        } catch (error: any) {
            console.error(`❌ Error cleaning up blog folders: ${error.message}`);
            return {
                success: false,
                message: `Failed to cleanup blog folders: ${error.message}`,
                files_deleted: 0,
                folders_deleted: 0
            };
        }
    }
});

export const downloadImageTool = createTool({
    id: "download-image",
    description: "Downloads an image file from a URL to a target folder. The filename can include an extension, or one will be detected from the Content-Type header or URL.",
    inputSchema: z.object({
        image_url: z.string().url().describe("The URL of the image to download"),
        target_folder: z.string().describe("The folder path where the image should be saved (relative to blog folder)"),
        filename: z.string().describe("The filename to save the image as. If no extension is provided, one will be detected."),
    }),
    outputSchema: z.object({
        success: z.boolean().describe("Whether the download was successful"),
        file_path: z.string().describe("The full path to the downloaded image file"),
        error: z.string().optional().describe("Error message if download failed"),
    }),
    execute: async ({ context }) => {
        const { image_url, target_folder, filename } = context;
        try {
            if (!image_url || !target_folder || !filename) {
                throw new Error('Image URL, target folder, and filename are required');
            }
            
            const resolvedTargetFolder = resolveBlogPath(target_folder);
            await mkdir(resolvedTargetFolder, { recursive: true });
            
            const { buffer: imageBuffer, contentType } = await downloadImageFromUrl(image_url);
            
            let extension = '';
            if (!filename.includes('.')) {
                if (contentType) {
                    extension = getExtensionFromContentType(contentType);
                }
                if (!extension) {
                    extension = getExtensionFromUrl(image_url);
                }
            }
            
            const finalFilename = extension ? `${filename}${extension}` : filename;
            const filePath = join(resolvedTargetFolder, finalFilename);
            await writeFile(filePath, imageBuffer);
            
            console.log(`✓ Image downloaded successfully: ${filePath}`);
            return { success: true, file_path: filePath };
        } catch (error: any) {
            console.error(`❌ Error downloading image: ${error.message}`);
            return { success: false, file_path: "", error: error.message || "Failed to download image" };
        }
    }
});

