import { relations } from "drizzle-orm/relations";
import { users, notes, categories } from "./schema";

export const notesRelations = relations(notes, ({one}) => ({
	user: one(users, {
		fields: [notes.userId],
		references: [users.id]
	}),
	category: one(categories, {
		fields: [notes.categoryId],
		references: [categories.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	notes: many(notes),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	notes: many(notes),
}));