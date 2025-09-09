"use client"

import { NotesDashboard } from "@/components/notes/notes-dashboard"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto w-full">
      <NotesDashboard />
    </div>
  )
}
