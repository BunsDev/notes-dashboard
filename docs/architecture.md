# Notes Dashboard Architecture

This document provides a detailed overview of the Notes Dashboard application architecture, covering its key components, data flow, and technical implementation.

## Application Overview

Notes Dashboard is a Next.js-based web application that allows users to create, organize, search, and manage interview preparation notes. The application offers features like categorization, pinning important notes, full-text search, and keyboard shortcuts for efficient navigation.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) with React 19
- **UI/Components**: [Shadcn UI](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/) primitives
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with PostCSS
- **Icons**: [Lucide React](https://lucide.dev/) icon set
- **Typography**: Geist font
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Database**: [Neon PostgreSQL](https://neon.tech/) (serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for database access
- **API Layer**: Next.js Server Actions for data operations

## Application Structure

```
/
├── app/                  # Next.js App Router structure
│   ├── api/              # API route handlers
│   │   └── notes/        # Notes API endpoints
│   ├── globals.css       # Global CSS styles
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Main page component
├── components/           # React components
│   ├── notes-dashboard.tsx  # Main dashboard component
│   └── ui/               # UI components (Shadcn UI)
├── hooks/                # Custom React hooks
├── db/                   # Database configuration
│   ├── index.ts          # Database client setup
│   ├── schema.ts         # Drizzle schema definitions
│   └── migrations/       # Database migrations
├── lib/                  # Utilities and shared code
│   └── actions/          # Server actions for data operations
├── public/               # Static assets
├── styles/               # Additional styling
├── docs/                 # Documentation
│   └── architecture.md   # This architecture document
├── drizzle.config.ts    # Drizzle ORM configuration
├── .env.local           # Environment variables (e.g. database connection)
└── package.json         # Project dependencies and scripts
```

## Component Architecture

### Main Components

1. **HomePage** (`app/page.tsx`)
   - Entry point client component that renders the NotesDashboard

2. **NotesDashboard** (`components/notes-dashboard.tsx`)
   - Core component managing the application state and UI
   - Handles CRUD operations for notes
   - Manages search and filtering functionality
   - Implements keyboard shortcuts
   - Contains dialog modals for creating/editing notes

3. **NoteCard** (`components/notes-dashboard.tsx`)
   - Displays individual note information
   - Provides actions for pinning, editing, and deleting notes
   - Shows category, title, and content with scrollable area

### UI Components (Shadcn UI)

The application leverages Shadcn UI components including:
- Button
- Card (Card, CardContent, CardHeader, CardTitle)
- Input
- Textarea
- Dialog (Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger)
- Select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)
- Badge
- Separator
- ScrollArea

## Data Model

### Database Schema

The application uses Drizzle ORM to define and interact with the PostgreSQL schema:

```typescript
// db/schema.ts
import { pgTable, serial, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  categoryId: serial('category_id').references(() => categories.id),
  isPinned: boolean('is_pinned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations and query schemas
export const notesRelations = relations(notes, ({ one }) => ({
  category: one(categories, {
    fields: [notes.categoryId],
    references: [categories.id],
  }),
}));
```

### Note Interface (Typescript)

```typescript
// Type definitions for frontend use
export interface Note {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  category?: Category; // From join
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
}
```

### Categories

Predefined categories for organizing notes (stored in the database):
- Technical (code-related topics)
- Behavioral (interview behavior questions)
- Concepts (theoretical knowledge)
- Tips & Tricks (miscellaneous helpful information)

The initial categories are seeded to the database during migration setup:

```typescript
// db/migrations/seed-categories.ts
import { db } from '../index';
import { categories } from '../schema';

export async function seedCategories() {
  const existingCategories = await db.select().from(categories);
  
  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      { 
        name: 'Technical', 
        slug: 'technical', 
        icon: 'Code', 
        color: 'bg-blue-100 text-blue-800' 
      },
      { 
        name: 'Behavioral', 
        slug: 'behavioral', 
        icon: 'Users', 
        color: 'bg-green-100 text-green-800' 
      },
      { 
        name: 'Concepts', 
        slug: 'concepts', 
        icon: 'BookOpen', 
        color: 'bg-purple-100 text-purple-800' 
      },
      { 
        name: 'Tips & Tricks', 
        slug: 'tips', 
        icon: 'Lightbulb', 
        color: 'bg-yellow-100 text-yellow-800' 
      },
    ]);
    console.log('Categories seeded successfully');
  }
};
```

## State Management

The application combines server-side data fetching with React's built-in state management:

### Server-Side Data Management
- **Drizzle ORM** for database interactions
- **Next.js Server Actions** for secure server-side data operations
- **Server Components** for initial data loading

### Client-Side State Management
- `useState` for managing component state (UI state, filters, dialogs)
- `useEffect` for side effects (keyboard shortcuts)
- `useMemo` for performance optimization (filtered notes)
- Custom hooks for data fetching and mutations

The main state variables include:
- `notes`: Array of all notes (fetched from database)
- `searchQuery`: Current search text
- `selectedCategory`: Current category filter
- `isCreateDialogOpen`: Dialog visibility state
- `editingNote`: Currently editing note (if any)
- `newNote`: Temporary state for creating new notes

## Features

### Core Functionality

1. **Notes Management**
   - Create new notes with title, content, and category
   - Edit existing notes
   - Delete notes
   - Pin/unpin important notes

2. **Search and Filtering**
   - Full-text search across note titles and content
   - Filter notes by category
   - Separate display of pinned and unpinned notes

3. **User Experience**
   - Responsive design for various screen sizes
   - Keyboard shortcuts for common actions
     - ⌘K (Ctrl+K): Focus search
     - ⌘N (Ctrl+N): Create new note
     - ESC: Close dialogs
   - Visual feedback for interactions
   - Empty state handling

## Data Flow

### Database Connection Setup

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Create connection to Neon PostgreSQL
const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle with the connection
export const db = drizzle(sql);
```

### Server Actions for Data Operations

```typescript
// lib/actions/notes.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { notes, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get all notes with their categories
export async function getNotes() {
  return db.query.notes.findMany({
    with: {
      category: true,
    },
    orderBy: [
      { isPinned: 'desc' },
      { updatedAt: 'desc' },
    ],
  });
}

// Create a new note
export async function createNote(note: { title: string; content: string; categoryId: number }) {
  await db.insert(notes).values({
    ...note,
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  revalidatePath('/'); // Refresh data
}

// Update an existing note
export async function updateNote(id: number, note: Partial<{ title: string; content: string; categoryId: number; isPinned: boolean }>) {
  await db.update(notes)
    .set({
      ...note,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id));
    
  revalidatePath('/');
}

// Delete a note
export async function deleteNote(id: number) {
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath('/');
}

// Toggle pin status
export async function toggleNotePin(id: number, isPinned: boolean) {
  await db.update(notes)
    .set({ isPinned: !isPinned, updatedAt: new Date() })
    .where(eq(notes.id, id));
    
  revalidatePath('/');
}

// Get all categories
export async function getCategories() {
  return db.select().from(categories);
}
```

### Data Flow in the Application

1. **Initial Data Loading**:
   - Notes and categories are fetched from Neon PostgreSQL database using Drizzle ORM
   - Server Components handle the initial data fetching

2. **Data Mutations**:
   - User interactions (create, update, delete, pin) trigger Server Actions
   - Server Actions perform database operations and revalidate paths for fresh data

3. **Client-Side Processing**:
   - Notes are filtered and sorted based on search, category, and pin status
   - UI reactively updates based on state changes

4. **Persistence**:
   - All data is persistently stored in Neon PostgreSQL
   - Changes are immediately reflected in the database

## Future Enhancements

Potential improvements to consider:

1. **Authentication**
   - Add user authentication for personalized notes
   - Implement multi-user support with role-based access control
   - Consider integration with Auth.js for authentication

2. **Advanced Database Features**
   - Implement full-text search using PostgreSQL's text search capabilities
   - Add pagination for notes display to improve performance with large datasets
   - Implement soft delete functionality to allow note recovery

3. **Advanced UI Features**
   - Rich text editing with Markdown support
   - Note tagging system for more flexible organization beyond categories
   - File attachments for notes (stored in a blob storage service)
   - Collaborative editing features

4. **Performance Optimization**
   - Implement virtualized lists for handling large numbers of notes
   - Add edge caching for frequently accessed data
   - Optimize queries with proper indexing
   - Implement query batching for related data

## Development Workflow

The application can be developed and tested using the following commands:

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Update .env.local with your Neon PostgreSQL connection details

# Generate database migrations
pnpm drizzle-kit generate

# Run database migrations
pnpm db:migrate

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

The development server runs on port 3335 as specified in the package.json.

## Database Setup

### Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Required Environment Variables

```
# .env.local
DATABASE_URL=postgresql://user:password@your-neon-instance.neon.tech/notes_dashboard
```

### Connecting to Neon PostgreSQL

To connect your application to a Neon PostgreSQL database:

1. Create an account on [Neon](https://neon.tech/)
2. Create a new project in the Neon dashboard
3. Create a new database called `notes_dashboard`
4. Copy the connection string provided by Neon
5. Add the connection string to your `.env.local` file
6. Run migrations to set up your database schema