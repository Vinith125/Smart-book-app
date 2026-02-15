'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { addBookmark, deleteBookmark } from '@/app/actions'
import LogoutButton from '@/components/LogoutButton'

type Bookmark = {
    id: string
    title: string
    url: string
    created_at: string
    user_id: string
}

export default function BookmarkManager({ initialBookmarks, user }: { initialBookmarks: Bookmark[], user: any }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
    const supabase = createClient()
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        const channel = supabase
            .channel('realtime bookmarks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => [payload.new as Bookmark, ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, user.id])

    async function handleAdd(formData: FormData) {
        // Optimistic update could go here, but we rely on realtime for this demo
        // to ensure consistency across tabs as requested.
        // Actually, standard form action will trigger a server revalidation.
        // But since we want "realtime without refresh", we might duplicate data if we revalidate + listen.
        // However, revalidatePath re-renders server components.
        // This client component has its own state.
        // If the parent server component re-renders and passes new `initialBookmarks`, this component won't update state
        // unless we add a useEffect to sync `initialBookmarks` to state.

        // For a pure realtime experience, we can ignore the router refresh or handle it gracefully.
        // Let's rely on the Realtime subscription for the UI update to avoid duplication.
        // We'll execute the server action, which inserts into DB.
        // DB triggers Realtime event.
        // Event updates state.

        await addBookmark(formData)
        formRef.current?.reset()
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">My Bookmarks</h1>
                <LogoutButton />
            </div>

            <form ref={formRef} action={handleAdd} className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. My Favorite Blog"
                        />
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                            type="url"
                            name="url"
                            id="url"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="https://example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium mt-2"
                    >
                        Add Bookmark
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {bookmarks.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No bookmarks yet. Add one above!</p>
                ) : (
                    bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{bookmark.title}</h3>
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline truncate block"
                                >
                                    {bookmark.url}
                                </a>
                            </div>
                            <button
                                onClick={() => deleteBookmark(bookmark.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                aria-label="Delete bookmark"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
