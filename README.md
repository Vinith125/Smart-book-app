# Smart Bookmark App

A simple, real-time bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**.

## Features

-   **Google Authentication**: Secure sign-up and login using Google OAuth.
-   **Private Bookmarks**: Each user has their own private list of bookmarks.
-   **Real-time Updates**: Bookmarks sync instantly across multiple tabs/devices without refreshing.
-   **Responsive Design**: Clean and functional UI using Tailwind CSS.

## Tech Stack

-   **Frontend**: Next.js 15 (App Router), Tailwind CSS, TypeScript
-   **Backend**: Supabase (PostgreSQL, Auth, Realtime)
-   **Deployment**: Vercel

## Setup Instructions

### 1. Prerequisite: Supabase Project

1.  Create a new project on [Supabase](https://supabase.com).
2.  Go to **Project Settings > API** and copy the `Project URL` and `anon public` key.
3.  Go to **Authentication > Providers** and enable **Google**.
    -   You will need to set up a Google Cloud Project to get the Client ID and Secret.
    -   Add the Supabase Callback URL (e.g., `https://<your-project>.supabase.co/auth/v1/callback`) to your Google Console "Authorized redirect URIs".
4.  Go to **SQL Editor** in Supabase and run the content of `schema.sql` included in this repository. This sets up the database and Row Level Security (RLS).

### 2. Environment Variables

Rename `.env.local.example` to `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. run the application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Challenges & Solutions

### 1. Real-time Synchronization Across Tabs
**Problem**: Syncing state across multiple browser tabs without manual refresh.
**Solution**: Implemented Supabase Realtime subscriptions in the client-side `BookmarkManager` component.
-   We listen for `POSTGRES_CHANGES` events (INSERT, DELETE) on the `bookmarks` table.
-   When an event occurs, we update the local React state immediately.
-   This ensures that if User A adds a bookmark in Tab 1, Tab 2 receives the `INSERT` event and updates its list instantly.

### 2. Authentication with Next.js App Router
**Problem**: Managing auth sessions with Server Components and Middleware.
**Solution**: Used `@supabase/ssr` to handle cookie-based authentication.
-   Use `createServerClient` in Server Actions and Components to access the session.
-   Use `createBrowserClient` in Client Components.
-   Implemented a `middleware.ts` to refresh the session token on every request, ensuring the user stays logged in.

### 3. Optimistic Updates vs. Realtime
**Problem**: Balancing immediate feedback with data consistency.
**Solution**: relied primarily on Realtime events to drive the UI state for the list.
-   While Server Actions (`addBookmark`) trigger a `revalidatePath`, the `BookmarkManager` component explicitly listens for Realtime events to handle updates.
-   This avoids complex logic to deduplicate optimistic updates and ensures what the user sees is what's truly in the database.
