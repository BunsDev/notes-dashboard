import { pgTable, unique, varchar, timestamp, foreignKey, serial, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const categoryEnum = pgEnum("category_enum", ['technical', 'behavioral', 'about', 'concepts', 'tips'])


export const users = pgTable("users", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	created: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const notes = pgTable("notes", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	categoryId: integer("category_id").notNull(),
	urls: text().array(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	created: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notes_user_id_fkey"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "notes_category_id_fkey"
		}),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	icon: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 50 }).notNull(),
	created: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_slug_key").on(table.slug),
]);
