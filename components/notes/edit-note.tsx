import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Note } from "@/lib/types";
import { updateNote } from "@/lib/db/actions";

interface EditNoteProps {
    categories: {
        id: string;
        label: string;
        icon: any;
        color: string;
    }[]
    editingNote: Note | null
    setEditingNote: (note: Note | null) => void
}

{/* Edit Note Dialog */ }
export function EditNote({ categories, editingNote, setEditingNote }: EditNoteProps) {
    return (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
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
                            onValueChange={(value) => setEditingNote({ ...editingNote, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
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
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                            rows={8}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingNote(null)}>
                                Cancel
                            </Button>
                            <Button onClick={() => updateNote(editingNote?.id,
                                {
                                    title: editingNote?.title,
                                    content: editingNote?.content,
                                    categoryId: parseInt(editingNote?.id),
                                    urls: editingNote?.urls,
                                    isPinned: editingNote?.isPinned,
                                    updated: new Date()
                                })}>Update Note</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}       