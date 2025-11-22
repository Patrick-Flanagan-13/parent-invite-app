import { prisma } from '@/lib/db'
import { createSlot, deleteSlot } from '../actions'
import { Slot } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SlotWithDetails = Slot & {
    _count: { signups: number },
    signups: { parentName: string, email: string }[],
    createdBy?: { username: string, name: string | null } | null
}

export default async function AdminPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const isAdmin = session.user.role === 'ADMIN'
    let slots: SlotWithDetails[] = []
    let error = null

    try {
        const where = isAdmin ? {} : { createdById: session.user.id }

        slots = await prisma.slot.findMany({
            where,
            orderBy: { startTime: 'asc' },
            include: {
                _count: { select: { signups: true } },
                signups: { select: { parentName: true, email: true } },
                createdBy: { select: { username: true, name: true } }
            },
        })
    } catch (e: any) {
        console.error('Failed to fetch slots:', e)
        error = e.message || 'Failed to load slots'
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-sm text-red-700">Error loading dashboard: {error}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl md:text-4xl font-extrabold">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                {isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}
                            </span>
                        </h1>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-medium">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Create Slot Card */}
                <div className="bg-white rounded-2xl shadow-xl mb-12 overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Create New Time Slot</h2>
                                <p className="text-blue-100 text-sm mt-1">Add a new conference time for parents to book</p>
                            </div>
                        </div>
                    </div>

                    <form action={createSlot} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    required
                                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    required
                                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Max Capacity</label>
                                <input
                                    type="number"
                                    name="maxCapacity"
                                    min="1"
                                    defaultValue="1"
                                    required
                                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Time Slot
                        </button>
                    </form>
                </div>

                {/* Slots List */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Conference Schedule</h2>
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                {slots.length} {slots.length === 1 ? 'Slot' : 'Slots'}
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {slots.map((slot, index) => (
                            <div key={slot.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 transition-all duration-200 group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-bold text-gray-900 mb-1">
                                                {new Date(slot.startTime).toLocaleString(undefined, {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            <p className="text-base text-gray-600 font-medium">
                                                {new Date(slot.startTime).toLocaleTimeString(undefined, {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                                {' - '}
                                                {new Date(slot.endTime).toLocaleTimeString(undefined, {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </p>

                                            {/* Admin Info: Created By */}
                                            {isAdmin && slot.createdBy && (
                                                <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                    Created by: {slot.createdBy.name || slot.createdBy.username}
                                                </p>
                                            )}

                                            <div className="mt-2 flex items-center space-x-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${slot._count.signups >= slot.maxCapacity
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {slot._count.signups} / {slot.maxCapacity} Booked
                                                </span>
                                                {slot._count.signups >= slot.maxCapacity && (
                                                    <span className="text-xs text-red-600 font-semibold">★ FULL</span>
                                                )}
                                            </div>

                                            {/* Signups Details */}
                                            {slot.signups.length > 0 && (
                                                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm">
                                                    <p className="font-semibold text-gray-700 mb-1">Registered Parents:</p>
                                                    <ul className="space-y-1">
                                                        {slot.signups.map((signup, i) => (
                                                            <li key={i} className="text-gray-600 flex items-center">
                                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                                                {signup.parentName} <span className="text-gray-400 mx-1">•</span> {signup.email}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <form action={deleteSlot.bind(null, slot.id)}>
                                        <button
                                            type="submit"
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-200 hover:border-red-600 transition-all duration-200"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                        {slots.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Slots Found</h3>
                                <p className="text-gray-600">
                                    {isAdmin
                                        ? "No slots have been created yet."
                                        : "You haven't created any time slots yet."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
