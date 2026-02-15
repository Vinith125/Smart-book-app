# Smart Bookmark App

## 📌 Project Overview
A modern, real-time bookmark manager application built with **Next.js 15 (App Router)**, **Supabase**, and **Tailwind CSS**.

This application allows users to securely sign in with their Google account, save their favorite links, and access them instantly across all devices. The standout feature is **Real-time Synchronization**: add a bookmark in one tab, and it instantly appears in all other open tabs without refreshing.

## 🚀 Live Demo
[https://smart-book-app-pied.vercel.app/](https://smart-book-app-pied.vercel.app/)

## ✨ Key Features
-   **🔐 Secure Authentication**: Seamless Google OAuth integration via Supabase Auth.
-   **⚡ Real-time Updates**: Changes are pushed instantly to all connected clients using Supabase Realtime (PostgreSQL Replication).
-   **📱 Responsive UI**: Beautiful, mobile-friendly interface built with Tailwind CSS.
-   **🛡️ Row Level Security (RLS)**: Data is protected at the database level; users can only see and manage their own bookmarks.
-   **🚀 High Performance**: Built on Next.js 15 with Server Actions for snappy interactions.

## 🛠️ Tech Stack
-   **Frontend Framework**: Next.js 15 (React 19)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **Backend / Database**: Supabase (PostgreSQL)
-   **Authentication**: Supabase Auth (Google OAuth)
-   **Deployment**: Vercel

## ⚙️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Vinith125/Smart-book-app.git
cd Smart-book-app
npm install
```

### 2. Configure Environment Variables
Rename `.env.local.example` to `.env.local` and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase Database
Run the following SQL in your Supabase SQL Editor to create the table and policies:

```sql
/** 
* Create a table to store bookmarks 
*/
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  user_id uuid references auth.users not null
);

/**
* Enable Row Level Security (RLS)
*/
alter table bookmarks enable row level security;

/**
* Create policies
*/
create policy "Users can view their own bookmarks" 
on bookmarks for select using ( auth.uid() = user_id );

create policy "Users can insert their own bookmarks" 
on bookmarks for insert with check ( auth.uid() = user_id );

create policy "Users can delete their own bookmarks" 
on bookmarks for delete using ( auth.uid() = user_id );

/**
* Enable Realtime
*/
alter publication supabase_realtime add table bookmarks;
```

### 4. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment
This project is deployed on **Vercel**.
To deploy your own version:
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
4.  Deploy!

## 🧪 Implementation Details

### Real-time Logic
The app uses a hybrid approach for optimal user experience:
1.  **Server Actions** (`addBookmark`) handle robust data mutation and validation.
2.  **Client Components** (`BookmarkManager`) subscribe to Supabase Realtime channels.
3.  When the database changes, Supabase pushes the payload to the client, which updates the local state immediately.

### Authentication
Implemented using `@supabase/ssr` to handle cookie-based sessions securely in the Next.js App Router environment. Middleware ensures the session remains active and secure.
