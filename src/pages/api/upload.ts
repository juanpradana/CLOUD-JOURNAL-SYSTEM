
import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }

  // Validation: Size (Max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "File too large (Max 2MB)" }), { status: 400 });
  }

  // Validation: Type (WebP, JPG, PNG)
  const allowedTypes = ["image/webp", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return new Response(JSON.stringify({ error: "Invalid file type. Only WebP, JPG, PNG allowed." }), { status: 400 });
  }

  // Generate unique filename: Timestamp-UUID.ext
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);

  try {
    // Ensure dir exists
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    return new Response(
      JSON.stringify({
        url: `/uploads/${filename}`,
        message: "Upload successful",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
