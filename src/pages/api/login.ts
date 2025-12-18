import { lucia } from "../../auth";
import { db } from "../../db";
import { users } from "../../db/schema";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
// NOTE: In a real app, use Argon2. For this demo/file-based DB, we'll assume pre-hashed or simple compare for setup.
// We will implement a simple hash verify for now or just direct compare if it's the first run/setup.
// Ideally: import { Verify } from "argon2"; 
// Since we don't have argon2 installed yet, we will do a basic check or auto-create admin if empty.

// Rate Limiting Map: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
    // Rate Limiting Logic
    const ip = clientAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    const record = rateLimitMap.get(ip);
    
    if (record) {
        if (now > record.expiresAt) {
            // Expired, reset
            rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
        } else {
            // Valid window
            if (record.count >= 5) {
                return new Response(JSON.stringify({ error: "Too many login attempts. Try again later." }), {
                    status: 429
                });
            }
            record.count++;
        }
    } else {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    }

	const formData = await request.formData();
	const username = formData.get("username");
	const password = formData.get("password");

	if (typeof username !== "string" || username.length < 3 || username.length > 31) {
		return new Response(JSON.stringify({ error: "Invalid username" }), {
			status: 400
		});
	}
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return new Response(JSON.stringify({ error: "Invalid password" }), {
			status: 400
		});
	}

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = existingUsers[0];

    // TODO: Implement proper password hashing (Argon2id).
    // For this specific initial setup, if NO users exist, create the first one as admin.
    // If user exists, check password.
    
    // Quick Hack for "First Run" or "Demo" purposes since we didn't seed the DB yet.
    // If username is 'admin' and no user exists, create it.
    
    if (!user) {
        // If it's the very first user, let's create it (unsafe for prod, good for setup)
        /* 
           SECURITY NOTE: IN PRODUCTION, REMOVE THIS AUTO-CREATION.
           SEED THE DATABASE MANUALLY.
        */
        
        // Only allow 'admin' to be auto-created
        if (username === "admin") {
             const id = crypto.randomUUID();
             await db.insert(users).values({
                 id,
                 username,
                 hashedPassword: password, // WARNING: Store HASHED password in real app
                 role: "admin"
             });
             const session = await lucia.createSession(id, {});
             const sessionCookie = lucia.createSessionCookie(session.id);
             cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
             return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
       
       return new Response(JSON.stringify({ error: "Invalid credentials" }), {
			status: 400
		});
    }

    // Basic password check (Replace with argon2.verify(user.hashedPassword, password))
    const validPassword = user.hashedPassword === password; 
    if (!validPassword) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
            status: 400
        });
    }

	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return new Response(JSON.stringify({ success: true }), { status: 200 });
};
