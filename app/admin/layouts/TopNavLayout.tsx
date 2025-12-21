'use client'

import { logout } from '@/app/actions'
import { ReactNode } from 'react'

export default function TopNavLayout({
    children,
    user
}: {
    children: ReactNode
    user: any
}) {
    // Helper to check role safely
    const isAdmin = user.role === 'ADMIN'

    return (
        <div>
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <a href="/admin" className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Admin</a>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a
                                    href="/admin"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Dashboard
                                </a>
                                <a
                                    href={`/teachers/${user.username}`}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    View My Page
                                </a>
                                {isAdmin && (
                                    <>
                                        <a
                                            href="/admin/users"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                        >
                                            Manage Users
                                        </a>
                                        <a
                                            href="/admin/whitelist"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                        >
                                            Whitelist
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-sm text-gray-500">
                                Logged in as {user.username}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    )
}
