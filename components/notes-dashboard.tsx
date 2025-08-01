"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Pin, PinOff, Edit, Trash2, BookOpen, Code, Users, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Note {
  id: string
  title: string
  content: string
  category: string
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

const categories = [
  { id: "technical", label: "Technical", icon: Code, color: "bg-blue-100 text-blue-800" },
  { id: "behavioral", label: "Behavioral", icon: Users, color: "bg-green-100 text-green-800" },
  { id: "concepts", label: "Concepts", icon: BookOpen, color: "bg-purple-100 text-purple-800" },
  { id: "tips", label: "Tips & Tricks", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
]

const initialNotes: Note[] = [
  {
    id: "1",
    title: "STAR Method",
    content:
      "Situation: Set the context\nTask: Describe what you needed to accomplish\nAction: Explain what you did\nResult: Share the outcome",
    category: "behavioral",
    isPinned: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "React Hooks Rules",
    content:
      "1. Only call hooks at the top level\n2. Only call hooks from React functions\n3. Use ESLint plugin for hooks\n4. useState for state, useEffect for side effects",
    category: "technical",
    isPinned: true,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "3",
    title: "Time Complexity Cheat Sheet",
    content:
      "O(1) - Constant\nO(log n) - Logarithmic\nO(n) - Linear\nO(n log n) - Linearithmic\nO(n²) - Quadratic\nO(2^n) - Exponential",
    category: "concepts",
    isPinned: false,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "4",
    title: "Questions to Ask Interviewer",
    content:
      "• What does a typical day look like?\n• What are the biggest challenges facing the team?\n• How do you measure success in this role?\n• What opportunities are there for growth?",
    category: "tips",
    isPinned: true,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
]

export function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "technical",
  })

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
      // Escape to close dialogs
      if (e.key === "Escape") {
        setIsCreateDialogOpen(false)
        setEditingNote(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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

  const togglePin = (noteId: string) => {
    setNotes((prev) => prev.map((note) => (note.id === noteId ? { ...note, isPinned: !note.isPinned } : note)))
  }

  const createNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes((prev) => [note, ...prev])
    setNewNote({ title: "", content: "", category: "technical" })
    setIsCreateDialogOpen(false)
  }

  const updateNote = () => {
    if (!editingNote) return

    setNotes((prev) =>
      prev.map((note) => (note.id === editingNote.id ? { ...editingNote, updatedAt: new Date() } : note)),
    )
    setEditingNote(null)
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0]
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Note (⌘N)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                <Select value={newNote.category} onValueChange={(value) => setNewNote({ ...newNote, category: value })}>
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
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={8}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNote}>Create Note</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Keyboard Shortcuts:</strong> ⌘K (Search) • ⌘N (New Note) • ESC (Close Dialog)
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
                : "Create your first note to get started"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}

        {/* Edit Note Dialog */}
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
                  <Button onClick={updateNote}>Update Note</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

interface NoteCardProps {
  note: Note
  onTogglePin: (id: string) => void
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  getCategoryInfo: (categoryId: string) => any
}

function NoteCard({ note, onTogglePin, onEdit, onDelete, getCategoryInfo }: NoteCardProps) {
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
          <p className="text-xs text-gray-400">Updated {note.updatedAt.toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
