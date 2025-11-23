import { prisma } from '@/lib/db'
import SignupForm from '../../SignupForm'
import { Slot } from '@prisma/client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SlotWithCount = Slot & {
    _count: { signups: number }
    name?: string | null
    description?: string | null
    collectContributing?: boolean
    collectDonating?: boolean
}

export default async function TeacherPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params

    // Fetch user first to check existence and status
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true, name: true, username: true, status: true }
    })

    if (!user || user.status === 'SUSPENDED') {
        notFound()
    }

    const teacherName = user.name || user.username

    let slots: SlotWithCount[] = []
    let error = null

    try {
        slots = await prisma.slot.findMany({
            where: { createdById: user.id },
            orderBy: { startTime: 'asc' },
            include: {
                _count: { select: { signups: true } },
                createdBy: { select: { name: true, username: true } }
            },
        })
    } catch (e: any) {
        console.error('Failed to fetch slots:', e)
        error = e.message || 'Failed to load slots'
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">System Unavailable</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="font-bold text-gray-900 text-xl tracking-tight">Quail Run Elementary</span>
                        </a>
                    </div>
                    <a href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Teacher Login
                    </a>
                </div>
            </header>

            {/* Teacher Hero */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner">
                            {teacherName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{teacherName}</h1>
                            <p className="text-lg text-gray-600 mt-1">Conference Sign-Ups</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slots List */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-4">
                    {slots.map((slot) => {
                        const isFull = slot._count.signups >= slot.maxCapacity

                        return (
                            <details key={slot.id} className="group bg-white border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors rounded-xl shadow-sm">
                                <summary className="list-none cursor-pointer p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-100 text-slate-900 rounded-lg">
                                            <span className="text-xs font-bold uppercase tracking-wider">{new Date(slot.startTime).toLocaleString('en-US', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold">{new Date(slot.startTime).getDate()}</span>
                                        </div>
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {new Date(slot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                </h3>
                                                {slot.name && (
                                                    <span className="self-start sm:self-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-sm">
                                                        {slot.name}
                                                    </span>
                                                )}
                                            </div>
                                            {slot.description && <p className="text-slate-500 text-sm mt-1">{slot.description}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {isFull ? 'Fully Booked' : `${slot.maxCapacity - slot._count.signups} ${slot.maxCapacity - slot._count.signups === 1 ? 'spot' : 'spots'} open`}
                                        </div>
                                        <div className="w-8 h-8 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </summary>

                                {!isFull && (
                                    <div className="p-6 pt-0 border-t border-gray-100 mt-4 bg-slate-50/50">
                                        <div className="max-w-2xl mx-auto py-8">
                                            <SignupForm
                                                slotId={slot.id}
                                                collectContributing={slot.collectContributing}
                                                collectDonating={slot.collectDonating}
                                            />
                                        </div>
                                    </div>
                                )}
                            </details>
                        )
                    })}

                    {slots.length === 0 && (
                        <div className="text-center py-20 bg-white border border-gray-200 border-dashed rounded-xl">
                            <p className="text-slate-500">No conference slots are currently available for this teacher.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
