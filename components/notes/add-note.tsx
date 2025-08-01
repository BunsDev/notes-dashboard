"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNote } from "@/lib/db/actions";
import { getCurrentUser } from "@/lib/api/users";
import { toast } from "sonner";

interface AddNoteProps {
  categories: {
    id: string;
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
    categoryId: "1", // Default to first category
  });

  const resetForm = () => {
    setNote({
      title: "",
      content: "",
      categoryId: "1",
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
      const result = await createNote({
        title: note.title,
        content: note.content,
        categoryId: parseInt(note.categoryId),
        userId: "placeholder" // This will be overwritten by the server action
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
      <DialogContent className="max-w-2xl">
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
            value={note.categoryId}
            onValueChange={(value) => setNote({ ...note, categoryId: value })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Note content"
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            rows={8}
            disabled={isSubmitting}
          />
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
