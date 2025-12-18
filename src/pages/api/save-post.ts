
import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

export const POST: APIRoute = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { filename, content } = body;

        if (!filename || !content) {
            return new Response(JSON.stringify({ error: "Missing filename or content" }), { status: 400 });
        }

        const filePath = path.join(process.cwd(), "src/content/jurnal", filename);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Security check: Prevent path traversal
        if (path.basename(filePath) !== filename) {
             return new Response(JSON.stringify({ error: "Invalid filename" }), { status: 400 });
        }

        // RBAC: Check ownership if file exists
        try {
            const existingContent = await fs.readFile(filePath, "utf-8");
            const match = existingContent.match(/author_id:\s*(.*)/);
            if (match) {
                const authorId = match[1].trim();
                // If not admin and not owner, deny
                if (locals.user.role !== "admin" && locals.user.id !== authorId) {
                    return new Response(JSON.stringify({ error: "Unauthorized: You do not own this post" }), { status: 403 });
                }
            }
        } catch (err) {
            // File doesn't exist, it's a new post. 
            // Ensure the new content has the correct author_id for this user
            // We can strictly enforce this by REPLACING/INJECTING the author_id in the content to be sure.
        }

        // Enforce author_id in content to be current user if not present or if new file
        let finalContent = content;
        
        if (locals.user.role !== "admin") {
            // Force override author_id and author_username in the content to match current user
            // This prevents a user from manually sending a request with someone else's ID
            const userId = locals.user.id;
            const username = locals.user.username;

            // Replace or Insert author_id
            const authorIdRegex = /^author_id:\s*.+$/m;
            if (finalContent.match(authorIdRegex)) {
                finalContent = finalContent.replace(authorIdRegex, `author_id: "${userId}"`);
            } else {
                 // Insert after date if exists, or at end of frontmatter
                 finalContent = finalContent.replace(/(^date:.*$)/m, `$1\nauthor_id: "${userId}"`);
            }

            // Replace or Insert author_username
            const authorNameRegex = /^author_username:\s*.+$/m;
            if (finalContent.match(authorNameRegex)) {
                 finalContent = finalContent.replace(authorNameRegex, `author_username: "${username}"`);
            } else {
                 finalContent = finalContent.replace(/(^author_id:.*$)/m, `$1\nauthor_username: "${username}"`);
            }
        }
        
        await fs.writeFile(filePath, finalContent, "utf-8");

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
