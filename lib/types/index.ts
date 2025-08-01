export interface Note {
    id: string
    title: string
    userId: string
    content: string
    category: string
    categoryId: number
    urls: string[]
    isPinned: boolean
    created: Date
    updated: Date
}
