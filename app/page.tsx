"use client"

import { NotesDashboard } from "@/components/notes/notes-dashboard"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto w-full">
      <AuthWrapper>
        <NotesDashboard />
      </AuthWrapper>
    </div>
  )
}
