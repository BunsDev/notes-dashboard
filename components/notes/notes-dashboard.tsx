"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Pin, PinOff, Edit, Trash2, BookOpen, Code, Users, Lightbulb, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Note } from "@/lib/types"
import { AddNote } from "./add-note"
import { EditNote } from "./edit-note"
import { getNotes, toggleNotePin as toggleNotePinAction, deleteNote as deleteNoteAction } from "@/lib/db/actions"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogHeader } from "@/components/ui/dialog"

const categories = [
  { id: "technical", label: "Technical", icon: Code, color: "bg-blue-100 text-blue-800" },
  { id: "behavioral", label: "Behavioral", icon: Users, color: "bg-green-100 text-green-800" },
  { id: "concepts", label: "Concepts", icon: BookOpen, color: "bg-purple-100 text-purple-800" },
  { id: "tips", label: "Tips & Tricks", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
]

export function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

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
        const typedNotes: Note[] = result.data.map(note => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          // Map categoryId from database to frontend category property
          category: note.category?.id?.toString() || "1",
          // Ensure urls is always an array
          urls: note.urls || [],
          isPinned: note.isPinned,
          created: new Date(note.created),
          updated: new Date(note.updated)
        }))
        setNotes(typedNotes)
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
      const matchesCategory = selectedCategory === "all" || note.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [notes, searchQuery, selectedCategory])

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned)

  const togglePin = async (noteId: string) => {
    try {
      // Optimistically update UI
      setNotes((prev) => prev.map((note) => (
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      )))

      // Update in database
      const result = await toggleNotePinAction(noteId)

      if (!result.success) {
        // Revert on error
        toast.error(result.error || "Failed to update note")
        setNotes((prev) => prev.map((note) => (
          note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
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

  const deleteNote = async (noteId: string) => {
    try {
      // Optimistically update UI
      const notesToRestore = [...notes]
      setNotes((prev) => prev.filter((note) => note.id !== noteId))

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

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0]
  }

  const getNoteInfo = (noteId: string) => {
    return notes.find((note) => note.id === noteId) || notes[0]
  }

  const getUrls = (noteId: string) => {
    return getNoteInfo(noteId).urls
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Notes Dashboard</h1>
          <p className="text-gray-600">Quick access to your interview preparation notes</p>
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
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
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Keyboard Shortcuts:</strong> ⌘K (Search) • ⌘N (New Note) • ⌘C (Categories) • ESC (Close Dialog)
          </p>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">Pinned Notes</h2>
              <Badge variant="secondary">{pinnedNotes.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={togglePin}
                  onEdit={setEditingNote}
                  onDelete={deleteNote}
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
              <h2 className="text-xl font-semibold text-gray-900">All Notes</h2>
              <Badge variant="secondary">{unpinnedNotes.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={togglePin}
                  onEdit={setEditingNote}
                  onDelete={deleteNote}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "all"
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
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          onSuccess={handleNoteUpdated}
        />

      </div>

      {/* Category Selection Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
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
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => {
                setSelectedCategory("all")
                setIsCategoryDialogOpen(false)
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Categories
            </Button>
            {categories.map((category) => {
              const CategoryIcon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setIsCategoryDialogOpen(false)
                  }}
                >
                  <CategoryIcon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
interface NoteCardProps {
  note: Note
  onTogglePin: (id: string) => void
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  getCategoryInfo: (categoryId: string) => any
  getUrls: (noteId: string) => string[]
}

function NoteCard({ note, onTogglePin, onEdit, onDelete, getCategoryInfo, getUrls }: NoteCardProps) {
  const categoryInfo = getCategoryInfo(note.category)
  const CategoryIcon = categoryInfo.icon

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CategoryIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <CardTitle className="text-base truncate">{note.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onTogglePin(note.id)} className="h-8 w-8 p-0">
              {note.isPinned ? <PinOff className="h-4 w-4 text-orange-500" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(note)} className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
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
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
        </ScrollArea>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-400">Updated {note.updated.toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
