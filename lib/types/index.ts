export interface Note {
    id: string
    title: string
    content: string
    category: string
    urls: string[]
    isPinned: boolean
    created: Date
    updated: Date
}
