import { prisma } from '@/lib/db'
import { createSlot, deleteSlot } from '../actions'
import { Slot } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SlotWithDetails = Slot & {
    _count: { signups: number },
    signups: { id: string, parentName: string, childName: string | null, email: string, createdAt: Date, attendeeCount: number }[],
    createdBy?: { username: string, name: string | null } | null
}

import RegisterPasskey from './RegisterPasskey'
import CreateSlotForm from './CreateSlotForm'
import AdminSlotList from './AdminSlotList'

export default async function AdminPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const isAdmin = session.user.role === 'ADMIN'
    let slots: SlotWithDetails[] = []
    let templates: any[] = []
    let events: any[] = []
    let error = null

    try {
        const where = isAdmin ? {} : { createdById: session.user.id }
        const eventWhere = isAdmin ? {} : { userId: session.user.id }

        const [slotsData, templatesData, eventsData] = await Promise.all([
            prisma.slot.findMany({
                where,
                orderBy: { startTime: 'asc' },
                include: {
                    _count: { select: { signups: true } },
                    signups: { select: { id: true, parentName: true, childName: true, email: true, createdAt: true, attendeeCount: true } },
                    createdBy: { select: { username: true, name: true } },
                    // @ts-ignore
                    template: { select: { name: true } }
                },
            }),
            // @ts-ignore
            prisma.slotTemplate.findMany({
                orderBy: { name: 'asc' }
            }),
            // @ts-ignore
            prisma.eventPage.findMany({
                where: eventWhere,
                orderBy: { title: 'asc' },
                select: { id: true, title: true }
            })
        ])
        slots = slotsData as any
        templates = templatesData
        events = eventsData
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
                                Manage your slots and view signups
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="/admin/events"
                                className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
                            >
                                Manage Events
                            </a>
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
                                <h2 className="text-2xl font-bold text-white">Create New Slot</h2>
                                <p className="text-blue-100 text-sm mt-1">Add slot for parents to book</p>
                            </div>
                        </div>
                    </div>

                    <CreateSlotForm templates={templates} events={events} />
                </div>

                {/* Slots List */}
                <AdminSlotList slots={slots} isAdmin={isAdmin} />
            </div>
        </div>
    )
}
