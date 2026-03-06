import { create } from 'zustand'

export type BreadcrumbItem = {
    title: string
    url?: string
}

type BreadcrumbState = {
    items: BreadcrumbItem[]
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
    items: [],
    setBreadcrumbs: (items) => set({ items }),
}))
