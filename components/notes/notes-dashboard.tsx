/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Pin, PinOff, Edit, Trash2, BookOpen, Code, Users, Lightbulb, Plus, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Category, Note } from "@/lib/db/schema"
import { AddNote } from "./add-note"
import { EditNote } from "./edit-note"
import { NoteViewer } from "./note-viewer"
import { getNotes, toggleNotePin as toggleNotePinAction, deleteNote as deleteNoteAction } from "@/lib/db/actions"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogHeader } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

const categories = [
  { id: 0, label: "All Categories", icon: Code, color: "bg-blue-100 text-blue-800" },
  { id: 1, label: "Technical", icon: Code, color: "bg-blue-100 text-blue-800" },
  { id: 2, label: "Behavioral", icon: Users, color: "bg-green-100 text-green-800" },
  { id: 3, label: "About", icon: FileText, color: "bg-blue-100 text-blue-800" },
  { id: 4, label: "Concepts", icon: BookOpen, color: "bg-purple-100 text-purple-800" },
  { id: 5, label: "Tips", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
]

export function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number>(1)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; noteId: string; noteTitle: string }>({ isOpen: false, noteId: "", noteTitle: "" })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("search-input")?.focus()
      }
      // Cmd/Ctrl + N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        setIsCreateDialogOpen(true)
      }
      // Cmd/Ctrl + C for categories
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault()
        setIsCategoryDialogOpen(true)
      }
      // Escape to close dialogs
      if (e.key === "Escape") {
        setIsCreateDialogOpen(false)
        setEditingNote(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Load notes from database
  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const result = await getNotes()
      if (result.success && result.data) {
        const typedNotes = result.data.map(note => ({
          ...note,
          // Convert dates from strings to Date objects if needed
          created: new Date(note.created),
          updated: new Date(note.updated)
        }))
        setNotes(typedNotes)
        // setNotes already done in the mapping above
      } else {
        toast.error(result.error || "Failed to load notes")
      }
    } catch (error) {
      console.error("Error loading notes:", error)
      toast.error("An error occurred while loading notes")
    } finally {
      setIsLoading(false)
    }
  }

  // Load notes on initial render
  useEffect(() => {
    loadNotes()
  }, [])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 1 || note.categoryId === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [notes, searchQuery, selectedCategory])

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned)

  const togglePin = async (noteId: string) => {
    try {
      // Optimistically update UI
      setNotes((prev) => prev.map((note) => (
        note.id === Number(noteId) ? { ...note, isPinned: !note.isPinned } : note
      )))

      // Update in database
      const result = await toggleNotePinAction(noteId)

      if (!result.success) {
        // Revert on error
        toast.error(result.error || "Failed to update note")
        setNotes((prev) => prev.map((note) => (
          note.id === Number(noteId) ? { ...note, isPinned: !note.isPinned } : note
        )))
      }
    } catch (error) {
      console.error("Error toggling pin:", error)
      toast.error("An error occurred while updating note")
      // Revert on error
      loadNotes()
    }
  }

  // Handle successful note creation
  const handleNoteCreated = () => {
    loadNotes()
  }

  const handleNoteUpdated = () => {
    loadNotes()
    setEditingNote(null)
  }

  const handleDeleteClick = (noteId: string, noteTitle: string) => {
    setDeleteConfirmation({ isOpen: true, noteId, noteTitle })
  }

  const deleteNote = async (noteId: string) => {
    try {
      // Optimistically update UI
      const notesToRestore = [...notes]
      setNotes((prev) => prev.filter((note) => note.id !== Number(noteId)))

      // Delete from database
      const result = await deleteNoteAction(noteId)

      if (!result.success) {
        // Revert on error
        toast.error(result.error || "Failed to delete note")
        setNotes(notesToRestore)
      } else {
        toast.success("Note deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("An error occurred while deleting note")
      loadNotes()
    }
  }

  const getCategoryInfo = (categoryId: number) => {
    return categories.find((cat) => cat.id === Number(categoryId)) || categories[0]
  }

  const getNoteInfo = (noteId: string) => {
    return notes.find((note) => String(note.id) === noteId) || null
  }

  const getUrls = (noteId: string) => {
    const note = getNoteInfo(noteId)
    return note?.urls || []
  }

  return (
    <div className="min-h-screen bg-background overflow-auto">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Interview Notes Dashboard</h1>
            <p className="text-muted-foreground">Quick access to your interview preparation notes</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search-input"
              placeholder="Search notes... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory.toString()}
            onValueChange={(value: string) => setSelectedCategory(Number(value))}
            defaultValue={selectedCategory.toString()}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={selectedCategory.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectedCategory.toString()} />
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddNote
            categories={categories}
            onSuccess={handleNoteCreated}
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mb-6 p-3 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Keyboard Shortcuts:</strong> ⌘K (Search) • ⌘N (New Note) • ⌘C (Categories) • ESC (Close Dialog)
          </p>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-foreground">Pinned Notes</h2>
              <Badge variant="secondary">{pinnedNotes.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={togglePin}
                  onEdit={setEditingNote}
                  onDelete={handleDeleteClick}
                  onView={setViewingNote}
                  getUrls={getUrls}
                  getCategoryInfo={getCategoryInfo}
                />
              ))}
            </div>
          </div>
        )}

        {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && <Separator className="mb-8" />}

        {/* All Notes */}
        {unpinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">All Notes</h2>
              <Badge variant="secondary">{unpinnedNotes.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={togglePin}
                  onEdit={setEditingNote}
                  onDelete={handleDeleteClick}
                  onView={setViewingNote}
                  getCategoryInfo={getCategoryInfo}
                  getUrls={getUrls}
                />
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 1
                ? "Try adjusting your search or filter"
                : "Create your first note to get started."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}

        {/* Edit Note Dialog */}
        <EditNote
          categories={categories}
          editingNote={editingNote as any}
          setEditingNote={setEditingNote as (note: any) => void}
          isOpen={!!editingNote}
          onOpenChange={(open) => {
            if (!open) setEditingNote(null);
          }}
          onSuccess={handleNoteUpdated}
        />

        {/* Note Viewer Dialog */}
        <NoteViewer
          note={viewingNote as any}
          isOpen={!!viewingNote}
          onOpenChange={(open) => {
            if (!open) setViewingNote(null);
          }}
          getCategoryInfo={getCategoryInfo}
        />

      </div>

      {/* Category Selection Dialog */}
      <CategorySelectionDialog 
        categories={categories} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
        onConfirm={() => deleteNote(deleteConfirmation.noteId)}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteConfirmation.noteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
interface NoteCardProps {
  note: Note
  onTogglePin: (id: string) => void
  onEdit: (note: Note) => void
  onDelete: (id: string, title: string) => void
  onView: (note: Note) => void
  getCategoryInfo: (categoryId: number) => any
  getUrls: (noteId: string) => string[]
}

function NoteCard({ note, onTogglePin, onEdit, onDelete, onView, getCategoryInfo, getUrls }: NoteCardProps) {
  const categoryInfo = getCategoryInfo(note.categoryId)
  const CategoryIcon = categoryInfo.icon

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open note if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onView(note)
  }

  return (
    <Card 
      className="group hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CategoryIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <CardTitle className="text-base truncate">{note.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTogglePin(note.id.toString()) }} className="h-8 w-8 p-0">
              {note.isPinned ? <PinOff className="h-4 w-4 text-orange-500" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(note) }} className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(note) }} className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(note.id.toString(), note.title) }}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Badge className={`w-fit text-xs ${categoryInfo.color}`}>{categoryInfo.label}</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
        </ScrollArea>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">Updated {note.updated.toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const CategorySelectionDialog = ({ categories, selectedCategory, setSelectedCategory, isOpen, onOpenChange }: { categories: any, selectedCategory: number, setSelectedCategory: (category: number) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Select Category</DialogTitle>
        </DialogHeader>
        <DialogTrigger asChild>
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Select Category
          </Button>
        </DialogTrigger>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === 1 ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => {
              setSelectedCategory(1)
              onOpenChange(false)
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            All Categories
          </Button>
          {categories.map((category: Category) => {
            const CategoryIcon = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedCategory(category.id)
                  onOpenChange(false)
                }}
              >
                <CategoryIcon />
                {category.name}
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

