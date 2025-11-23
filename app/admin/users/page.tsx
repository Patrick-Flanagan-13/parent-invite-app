import { prisma } from '@/lib/db'
import { createUser, updateUser, toggleUserStatus, resetPassword, approveUser, rejectUser } from './actions'
import { User } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin')
    }

    let users: User[] = []
    let error = null

    try {
        users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        })
    } catch (e: any) {
        console.error('Failed to fetch users:', e)
        error = e.message || 'Failed to load users'
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                Error loading users: {error}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            {/* Pending Approvals Section */}
            {users.filter(u => u.status === 'SUSPENDED').length > 0 && (
                <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pending Approval ({users.filter(u => u.status === 'SUSPENDED').length})
                    </h2>
                    <div className="space-y-3">
                        {users.filter(u => u.status === 'SUSPENDED').map(user => (
                            <div key={user.id} className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">{user.username}</p>
                                    {user.name && <p className="text-sm text-gray-600">{user.name}</p>}
                                    <p className="text-xs text-gray-500">Requested: {new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <form action={approveUser.bind(null, user.id)}>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm"
                                        >
                                            ✓ Approve
                                        </button>
                                    </form>
                                    <form action={rejectUser.bind(null, user.id)}>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm"
                                        >
                                            ✗ Reject
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New User</h2>
                <form action={createUser} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                        <input
                            type="text"
                            name="name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                            <option value="USER">Regular</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Create
                    </button>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                    <form action={toggleUserStatus.bind(null, user.id, user.status)}>
                                        <button
                                            type="submit"
                                            className={`${user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                                }`}
                                        >
                                            {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </form>

                                    {/* Simple Password Reset Form inline for demo purposes */}
                                    <form action={resetPassword} className="flex gap-1">
                                        <input type="hidden" name="id" value={user.id} />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="New Pass"
                                            className="border rounded px-2 py-1 text-xs w-24"
                                            required
                                        />
                                        <button type="submit" className="text-indigo-600 hover:text-indigo-900">Set</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
