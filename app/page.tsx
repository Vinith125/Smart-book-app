import { createClient } from '@/utils/supabase/server'
import LoginButton from '@/components/LoginButton'
import BookmarkManager from '@/components/BookmarkManager'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col gap-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Smart Bookmark App
          </h1>
          <p className="text-xl text-center text-gray-600 mb-8 max-w-lg">
            A simple, secure bookmark manager. Sign in to save your favorite links and access them from anywhere in real-time.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <LoginButton />
          </div>
        </div>
      </main>
    )
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <BookmarkManager initialBookmarks={bookmarks ?? []} user={user} />
    </main>
  )
}
