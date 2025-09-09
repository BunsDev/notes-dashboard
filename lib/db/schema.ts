import { pgTable, serial, text, varchar, boolean, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Category enum for type safety
export const categoryEnum = pgEnum('category_enum', [
  'technical',
  'behavioral',
  "about",
  'concepts',
  'tips',
]);

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  created: timestamp('created').defaultNow().notNull(),
});

// Notes table
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  categoryId: serial('category_id').references(() => categories.id).notNull(),
  urls: text('urls').array(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  created: timestamp('created').defaultNow().notNull(),
  updated: timestamp('updated').defaultNow().notNull(),
});

// User table (for future authentication)
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  created: timestamp('created').defaultNow().notNull(),
  updated: timestamp('updated').defaultNow().notNull(),
});

// Relations
export const notesRelations = relations(notes, ({ one }) => ({
  category: one(categories, {
    fields: [notes.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));

// Types for frontend use
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
