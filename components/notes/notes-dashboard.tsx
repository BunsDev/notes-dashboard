/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Pin, PinOff, Edit, Trash2, BookOpen, Code, Users, Lightbulb, Plus, FileText, Eye, Grid3X3, List, LogIn, GripVertical } from "lucide-react"
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
import { getNotes, toggleNotePin as toggleNotePinAction, deleteNote as deleteNoteAction, updateNoteOrder } from "@/lib/db/actions"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogHeader } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid")
  const [draggedNote, setDraggedNote] = useState<Note | null>(null)
  const [dragOverNote, setDragOverNote] = useState<string | null>(null)

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

  const handleDragStart = (e: React.DragEvent, note: Note) => {
    setDraggedNote(note)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", note.id.toString())
  }

  const handleDragOver = (e: React.DragEvent, noteId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverNote(noteId)
  }

  const handleDragLeave = () => {
    setDragOverNote(null)
  }

  const handleDrop = async (e: React.DragEvent, targetNote: Note) => {
    e.preventDefault()
    setDragOverNote(null)
    
    if (!draggedNote || draggedNote.id === targetNote.id) {
      setDraggedNote(null)
      return
    }

    try {
      // Get the current notes in the same pinned group
      const isPinnedGroup = draggedNote.isPinned
      const relevantNotes = notes.filter(note => note.isPinned === isPinnedGroup)
      
      // Find positions
      const draggedIndex = relevantNotes.findIndex(note => note.id === draggedNote.id)
      const targetIndex = relevantNotes.findIndex(note => note.id === targetNote.id)
      
      if (draggedIndex === -1 || targetIndex === -1) return

      // Reorder the notes array
      const newNotes = [...relevantNotes]
      const [removed] = newNotes.splice(draggedIndex, 1)
      newNotes.splice(targetIndex, 0, removed)

      // Update sort orders
      for (let i = 0; i < newNotes.length; i++) {
        const note = newNotes[i]
        const newOrder = i
        await updateNoteOrder(note.id.toString(), newOrder)
      }

      // Refresh the notes list
      loadNotes()
      toast.success("Note order updated")
    } catch (error) {
      console.error("Error reordering notes:", error)
      toast.error("Failed to reorder notes")
    }
    
    setDraggedNote(null)
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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
            <ThemeToggle />
          </div>
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
          <ToggleGroup type="single" value={layoutMode} onValueChange={(value) => value && setLayoutMode(value as "grid" | "list")}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
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
            <div className={layoutMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
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
                  layoutMode={layoutMode}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  isDraggedOver={dragOverNote === note.id.toString()}
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
            <div className={layoutMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
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
                  layoutMode={layoutMode}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  isDraggedOver={dragOverNote === note.id.toString()}
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
  layoutMode: "grid" | "list"
  onDragStart: (e: React.DragEvent, note: Note) => void
  onDragOver: (e: React.DragEvent, noteId: string) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, note: Note) => void
  isDraggedOver: boolean
}

function NoteCard({ note, onTogglePin, onEdit, onDelete, onView, getCategoryInfo, getUrls, layoutMode, onDragStart, onDragOver, onDragLeave, onDrop, isDraggedOver }: NoteCardProps) {
  const categoryInfo = getCategoryInfo(note.categoryId)
  const CategoryIcon = categoryInfo.icon

  if (layoutMode === "list") {
    return (
      <Card 
        className={`group hover:shadow-md transition-shadow cursor-pointer relative ${isDraggedOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
        onClick={() => onView(note)}
        draggable
        onDragStart={(e) => onDragStart(e, note)}
        onDragOver={(e) => onDragOver(e, note.id.toString())}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, note)}
      >
        <div className="flex items-start p-4 gap-4 min-h-[100px]">
          <div 
            className="cursor-grab active:cursor-grabbing mt-1" 
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-start gap-2 flex-1 min-w-0 pr-24">
            <CategoryIcon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{note.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${categoryInfo.color}`}>{categoryInfo.label}</Badge>
                <span className="text-xs text-gray-400">Updated {note.updated.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-sm">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTogglePin(note.id.toString()) }} className="h-6 w-6 p-0">
              {note.isPinned ? <PinOff className="h-3 w-3 text-orange-500" /> : <Pin className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(note) }} className="h-6 w-6 p-0">
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(note) }} className="h-6 w-6 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(note.id.toString(), note.title) }}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`group hover:shadow-md transition-shadow cursor-pointer relative ${isDraggedOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      onClick={() => onView(note)}
      draggable
      onDragStart={(e) => onDragStart(e, note)}
      onDragOver={(e) => onDragOver(e, note.id.toString())}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, note)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="cursor-grab active:cursor-grabbing mr-2" onMouseDown={(e) => e.stopPropagation()}>
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            <CategoryIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <CardTitle className="text-base truncate">{note.title}</CardTitle>
          </div>
        </div>
        <Badge className={`w-fit text-xs ${categoryInfo.color}`}>{categoryInfo.label}</Badge>
      </CardHeader>
      <CardContent className="pb-12">
        <ScrollArea className="h-32">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
        </ScrollArea>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">Updated {note.updated.toLocaleDateString()}</p>
        </div>
      </CardContent>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-sm">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTogglePin(note.id.toString()) }} className="h-6 w-6 p-0">
          {note.isPinned ? <PinOff className="h-3 w-3 text-orange-500" /> : <Pin className="h-3 w-3" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(note) }} className="h-6 w-6 p-0">
          <Eye className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(note) }} className="h-6 w-6 p-0">
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onDelete(note.id.toString(), note.title) }}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
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

