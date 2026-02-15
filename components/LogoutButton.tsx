'use client'

import { signOut } from '@/app/auth/actions'

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
            Sign out
        </button>
    )
}
