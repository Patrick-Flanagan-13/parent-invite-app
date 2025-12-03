import { prisma } from '@/lib/db'
import { createSlot, deleteSlot } from '../actions'
import { Slot } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SlotWithDetails = Slot & {
    _count: { signups: number },
    signups: { parentName: string, childName: string | null, email: string }[],
    createdBy?: { username: string, name: string | null } | null
}

import RegisterPasskey from './RegisterPasskey'
import CreateSlotForm from './CreateSlotForm'

export default async function AdminPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const isAdmin = session.user.role === 'ADMIN'
    let slots: SlotWithDetails[] = []
    let templates: any[] = []
    let error = null

    try {
        const where = isAdmin ? {} : { createdById: session.user.id }

        const [slotsData, templatesData] = await Promise.all([
            prisma.slot.findMany({
                where,
                orderBy: { startTime: 'asc' },
                include: {
                    _count: { select: { signups: true } },
                    signups: { select: { parentName: true, childName: true, email: true } },
                    createdBy: { select: { username: true, name: true } },
                    // @ts-ignore
                    template: { select: { name: true } }
                },
            }),
            // @ts-ignore
            prisma.slotTemplate.findMany({
                orderBy: { name: 'asc' }
            })
        ])
        slots = slotsData as any
        templates = templatesData
    } catch (e: any) {
        console.error('Failed to fetch data:', e)
        error = e.message || 'Failed to load dashboard'
    }

    if (error) {
        // ... (error handling)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Manage your conference slots and view signups
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAdmin && (
                                <a
                                    href="/admin/templates"
                                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
                                >
                                    Manage Templates
                                </a>
                            )}
                            <RegisterPasskey />
                            <form action={async () => {
                                'use server'
                                // ... logout logic ... 
                            }}>
                            </form>
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

                    <CreateSlotForm templates={templates} />
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
                                                                {signup.parentName} - {signup.childName} <span className="text-gray-400 mx-1">•</span> {signup.email}
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
