"use client"

import { NotesDashboard } from "@/components/notes/notes-dashboard"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export default function HomePage() {
  return (
    <AuthWrapper>
      <NotesDashboard />
    </AuthWrapper>
  )
}
