import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

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
                                {session.user.role === 'ADMIN' && (
                                    <a
                                        href="/admin/users"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Manage Users
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-sm text-gray-500">
                                Logged in as {session.user.username}
                            </span>
                            <form action={async () => {
                                'use server'
                                await logout()
                                redirect('/login')
                            }}>
                                <button
                                    type="submit"
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    )
}
