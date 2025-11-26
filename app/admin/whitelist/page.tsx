import { prisma } from '@/lib/db'
import { addWhitelistedEmail, removeWhitelistedEmail } from './actions'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Role } from '@prisma/client'

export default async function WhitelistPage() {
    const session = await getSession()
    if (!session || session.user.role !== Role.ADMIN) {
        redirect('/login')
    }

    const whitelistedEmails = await (prisma as any).whitelistedEmail.findMany({
        orderBy: { createdAt: 'desc' },
        include: { addedBy: true },
    }) as any[]

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Teacher Email Whitelist</h1>
                <p className="mt-2 text-gray-600">
                    Add email addresses here to automatically approve teacher accounts when they sign up.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Email</h2>
                <form action={addWhitelistedEmail as any} className="flex gap-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="teacher@example.com"
                        required
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add to Whitelist
                    </button>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Added By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Added
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {whitelistedEmails.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No whitelisted emails found.
                                </td>
                            </tr>
                        ) : (
                            whitelistedEmails.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.addedBy.name || item.addedBy.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <form action={removeWhitelistedEmail.bind(null, item.id) as any}>
                                            <button
                                                type="submit"
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Remove
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
