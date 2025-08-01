"use client";

import { useState } from "react";
// @ts-ignore - Import works at runtime
import { Eye, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Note } from "@/lib/types";
import { updateNote } from "@/lib/db/actions";
// @ts-ignore - Import works at runtime
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Custom stylesheet for the markdown editor - shared with add-note
const markdownStyles = `
.w-md-editor {
  box-shadow: none !important;
}

.w-md-editor-toolbar {
  border-radius: 0.375rem 0.375rem 0 0 !important;
}

.markdown-body {
  font-family: inherit !important;
  line-height: 1.6 !important;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
  margin-top: 1.5rem !important;
  margin-bottom: 0.75rem !important;
  font-weight: 600 !important;
}

.markdown-body code {
  padding: 0.2em 0.4em !important;
  background-color: rgba(27, 31, 35, 0.05) !important;
  border-radius: 3px !important;
}

.markdown-body pre {
  padding: 1em !important;
  border-radius: 5px !important;
}

.markdown-body blockquote {
  padding: 0 1em !important;
  color: #6a737d !important;
  border-left: 0.25em solid #dfe2e5 !important;
}

/* Fix for bullet points and lists */
.markdown-body ul {
  list-style-type: disc !important;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

.markdown-body ol {
  list-style-type: decimal !important;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

.markdown-body li {
  display: list-item !important;
  margin: 0.25em 0 !important;
}

.markdown-body li > p {
  margin-top: 0 !important;
}

/* Ensure proper spacing for all elements */
.markdown-body p {
  margin: 1em 0 !important;
}

/* Fix for task lists */
.markdown-body input[type="checkbox"] {
  margin-right: 0.5em !important;
}
`;

// Dynamically import the Markdown editor to avoid SSR issues
// @ts-ignore - Using any type to avoid TypeScript errors
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => {
    return mod.default;
  }),
  { ssr: false }
);

// Dynamically import the Markdown preview component
// @ts-ignore - Using any type to avoid TypeScript errors with markdown editor
const MarkdownPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => {
    return mod.default.Markdown;
  }),
  { ssr: false }
);

interface EditNoteProps {
    categories: {
        id: number;
        label: string;
        icon: any;
        color: string;
    }[]
    editingNote: Note | null
    setEditingNote: (note: Note | null) => void
    onSuccess?: () => void
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditNote({ categories, editingNote, setEditingNote, onSuccess, isOpen, onOpenChange }: EditNoteProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    return (
        <Dialog open={!!editingNote || isOpen} onOpenChange={onOpenChange ? onOpenChange : () => setEditingNote(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Note</DialogTitle>
                </DialogHeader>
                {editingNote && (
                    <div className="space-y-4">
                        <Input
                            placeholder="Note title"
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        />
                        <Select
                            value={editingNote.category}
                            onValueChange={(value: string) => setEditingNote({ ...editingNote, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {/* @ts-ignore - category.label is a string */}
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "edit" | "preview")}>
                            <TabsList className="grid w-full grid-cols-2 mb-2">
                                <TabsTrigger value="edit" className="flex items-center gap-2">
                                    {/* @ts-ignore - lucide-react icons are imported correctly */}
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex items-center gap-2">
                                    {/* @ts-ignore - lucide-react icons are imported correctly */}
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit" className="mt-0">
                                <>
                                    {/* Add the markdown styles */}
                                    <style jsx global>{markdownStyles}</style>
                                    
                                    <div data-color-mode="light" className="markdown-container">
                                        <MDEditor
                                            value={editingNote.content}
                                            /* @ts-ignore - proper type handling for MDEditor */
                                            // @ts-ignore - proper handling for onChange prop
                                            onChange={(val) => setEditingNote({ ...editingNote, content: val || "" })}
                                            preview="edit"
                                            height={300}
                                            toolbarHeight={40}
                                            visibleDragbar={false}
                                            textareaProps={{
                                                placeholder: "Write your markdown note here...",
                                                disabled: isSubmitting,
                                            }}
                                        />
                                    </div>
                                </>
                            </TabsContent>
                            <TabsContent value="preview" className="mt-0">
                                <>
                                    {/* Add the markdown styles */}
                                    <style jsx global>{markdownStyles}</style>
                                    
                                    <div className="border rounded-md p-4 min-h-[300px] overflow-y-auto bg-white" data-color-mode="light">
                                        {editingNote.content ? (
                                            <div className="markdown-body">
                                                {/* @ts-ignore - proper type handling for MarkdownPreview */}
                                                <MarkdownPreview source={editingNote.content} />
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground italic">Preview will appear here...</p>
                                        )}
                                    </div>
                                </>
                            </TabsContent>
                        </Tabs>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={onOpenChange ? () => onOpenChange(false) : () => setEditingNote(null)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    try {
                                        setIsSubmitting(true);
                                                // Ensure categoryId is a valid number before sending to the server
                                        const categoryId = Number(editingNote?.category);
                                        
                                        if (isNaN(categoryId)) {
                                            toast.error("Invalid category selected");
                                            return;
                                        }
                                        
                                        const result = await updateNote(editingNote?.id,
                                                    {
                                                        title: editingNote?.title,
                                                        content: editingNote?.content,
                                                        categoryId: categoryId,
                                                        urls: editingNote?.urls,
                                                        isPinned: editingNote?.isPinned,
                                                        updated: new Date()
                                                    });

                                        if (result.success) {
                                            toast.success("Note updated successfully");
                                            onOpenChange ? onOpenChange(false) : setEditingNote(null);
                                            if (onSuccess) onSuccess();
                                        } else {
                                            toast.error(result.error || "Failed to update note");
                                        }
                                    } catch (error) {
                                        console.error("Error updating note:", error);
                                        toast.error("An error occurred while updating the note");
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Updating..." : "Update Note"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}       