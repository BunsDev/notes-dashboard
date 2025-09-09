"use client";

import { useState, useEffect } from "react";
import { Plus, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createNote } from "@/lib/db/actions";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Head from "next/head";

// Custom stylesheet for the markdown editor
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
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => {
    // No TypeScript errors this way
    return mod.default;
  }),
  { ssr: false }
);

// Create a type for any needed for Markdown Preview
type MarkdownProps = {
  source: string;
};

// Dynamically import the Markdown preview component
const MarkdownPreview = dynamic<MarkdownProps>(
  () => import('@uiw/react-md-editor').then((mod) => {
    return mod.default.Markdown;
  }),
  { ssr: false }
);


interface AddNoteProps {
  categories: {
    id: number;
    label: string;
    icon: any;
    color: string;
  }[];
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddNote({ categories, onSuccess, isOpen: externalIsOpen, onOpenChange }: AddNoteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState({
    title: "",
    content: "",
    categoryId: 1, // Default to first category
  });
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const resetForm = () => {
    setNote({
      title: "",
      content: "",
      categoryId: 1,
    });
  };

  const handleSubmit = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // We don't need to get the user here as the server action does it,
      // but we need to pass a placeholder to satisfy TypeScript
      // Ensure categoryId is a valid number before sending to the server
      const categoryId = Number(note.categoryId);
      
      if (isNaN(categoryId)) {
        toast.error("Invalid category selected");
        return;
      }
      
      const result = await createNote({
        title: note.title,
        content: note.content,
        categoryId: categoryId,
        // Let the server action handle the user authentication
        // Pass a dummy value that will be overwritten on the server
        userId: ""
      });
      

      if (result.success) {
        toast.success("Note created successfully");
        resetForm();
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to create note");
      }
    } catch (error) {
      toast.error("An error occurred while creating the note");
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl resize" style={{ resize: 'both', minWidth: '500px', minHeight: '400px' }}>
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Note title"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            disabled={isSubmitting}
          />
          <Select
            value={note.categoryId.toString()}
            onValueChange={(value: string) => setNote({ ...note, categoryId: Number(value) })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "edit" | "preview")}>
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-0">
              
                {/* Add the markdown styles */}
                <style jsx global>{markdownStyles}</style>
                
                <div data-color-mode="dark" className="markdown-container bg-background/80 rounded-2xl border border-gray-700 p-2 overflow-y-auto">
                  <MDEditor
                    value={note.content}
                    onChange={(val) => setNote({ ...note, content: val || "" })}
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
              
            </TabsContent>
            <TabsContent value="preview" className="mt-0 overflow-y-auto">
                {/* Add the markdown styles */}
                <style jsx global>{markdownStyles}</style>
                
                <div className="min-h-[300px] overflow-y-auto bg-background/80 rounded-2xl border border-gray-700 p-2" data-color-mode="dark">
                  {note.content ? (
                    <div className="markdown-body">
                      <MarkdownPreview source={note.content} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Preview will appear here...</p>
                  )}
                </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
