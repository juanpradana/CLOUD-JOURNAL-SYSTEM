import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	username: text("username").notNull().unique(),
	hashedPassword: text("hashed_password").notNull(),
    role: text("role").default("author").notNull(), // 'admin' | 'author'
});

export const sessions = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: integer("expires_at").notNull()
});
