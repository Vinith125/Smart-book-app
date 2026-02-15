'use client'

import { signInWithGoogle } from '@/app/auth/actions'

export default function LoginButton() {
    return (
        <button
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors border border-gray-200"
        >
            <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4"
            />
            Sign in with Google
        </button>
    )
}
