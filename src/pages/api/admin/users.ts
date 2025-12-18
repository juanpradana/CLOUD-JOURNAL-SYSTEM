import type { APIRoute } from "astro";
import { db } from "../../../db";
import { sessions, users } from "../../../db/schema";
import { eq } from "drizzle-orm";

type Role = "admin" | "author";

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json"
		}
	});
}

function requireAdmin(locals: App.Locals): { id: string; username: string; role: string } {
	if (!locals.user) {
		throw Object.assign(new Error("Unauthorized"), { status: 401 });
	}
	if (locals.user.role !== "admin") {
		throw Object.assign(new Error("Forbidden"), { status: 403 });
	}
	return locals.user;
}

function parseRole(value: unknown): Role {
	if (value !== "admin" && value !== "author") {
		throw Object.assign(new Error("Invalid role"), { status: 400 });
	}
	return value;
}

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		requireAdmin(locals);
		const body = await request.json();
		const username = (body as any)?.username;
		const password = (body as any)?.password;
		const roleRaw = (body as any)?.role;

		if (typeof username !== "string" || username.length < 3 || username.length > 31) {
			return json({ error: "Invalid username" }, 400);
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return json({ error: "Invalid password" }, 400);
		}

		const role = parseRole(roleRaw);

		const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
		if (existing.length > 0) {
			return json({ error: "Username already exists" }, 409);
		}

		const id = crypto.randomUUID();
		await db.insert(users).values({
			id,
			username,
			hashedPassword: password,
			role
		});

		return json({ success: true, id });
	} catch (err) {
		const status = typeof (err as any)?.status === "number" ? (err as any).status : 500;
		return json({ error: (err as Error).message || "Internal Server Error" }, status);
	}
};

export const PATCH: APIRoute = async ({ request, locals }) => {
	try {
		const admin = requireAdmin(locals);
		const body = await request.json();
		const id = (body as any)?.id;
		const roleRaw = (body as any)?.role;

		if (typeof id !== "string" || id.length === 0) {
			return json({ error: "Invalid id" }, 400);
		}
		if (id === admin.id) {
			return json({ error: "You cannot change your own role" }, 400);
		}

		const role = parseRole(roleRaw);

		const target = await db
			.select({ id: users.id, role: users.role })
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (target.length === 0) {
			return json({ error: "User not found" }, 404);
		}

		// Prevent demoting the last admin
		if (target[0].role === "admin" && role === "author") {
			const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
			if (admins.length <= 1) {
				return json({ error: "Cannot demote the last admin" }, 400);
			}
		}

		await db.update(users).set({ role }).where(eq(users.id, id));
		return json({ success: true });
	} catch (err) {
		const status = typeof (err as any)?.status === "number" ? (err as any).status : 500;
		return json({ error: (err as Error).message || "Internal Server Error" }, status);
	}
};

export const DELETE: APIRoute = async ({ request, locals }) => {
	try {
		const admin = requireAdmin(locals);
		const body = await request.json();
		const id = (body as any)?.id;

		if (typeof id !== "string" || id.length === 0) {
			return json({ error: "Invalid id" }, 400);
		}
		if (id === admin.id) {
			return json({ error: "You cannot delete your own account" }, 400);
		}

		const target = await db
			.select({ id: users.id, role: users.role })
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (target.length === 0) {
			return json({ error: "User not found" }, 404);
		}

		// Prevent deleting the last admin
		if (target[0].role === "admin") {
			const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
			if (admins.length <= 1) {
				return json({ error: "Cannot delete the last admin" }, 400);
			}
		}

		// Remove sessions first
		await db.delete(sessions).where(eq(sessions.userId, id));
		await db.delete(users).where(eq(users.id, id));

		return json({ success: true });
	} catch (err) {
		const status = typeof (err as any)?.status === "number" ? (err as any).status : 500;
		return json({ error: (err as Error).message || "Internal Server Error" }, status);
	}
};

export const GET: APIRoute = async ({ locals }) => {
	try {
		requireAdmin(locals);
		const list = await db.select({ id: users.id, username: users.username, role: users.role }).from(users);
		return json({ users: list });
	} catch (err) {
		const status = typeof (err as any)?.status === "number" ? (err as any).status : 500;
		return json({ error: (err as Error).message || "Internal Server Error" }, status);
	}
};
