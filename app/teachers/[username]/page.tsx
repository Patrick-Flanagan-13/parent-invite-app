import { prisma } from '@/lib/db'
import SignupForm from '../../SignupForm'
import DonationLink from './DonationLink'
import SlotCard from '@/app/components/SlotCard'
import { Slot } from '@prisma/client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SlotWithCount = Slot & {
    _count: { signups: number }
    signups?: { attendeeCount: number }[]
    name?: string | null
    description?: string | null
    donationLink?: string | null
    collectContributing?: boolean
    collectDonating?: boolean
    displayNameAsTitle: boolean
    hideTime: boolean
    hideEndTime: boolean
}

export default async function TeacherPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params

    // Fetch user first to check existence and status
    const user = await prisma.user.findFirst({
        where: {
            username: {
                equals: decodeURIComponent(username),
                mode: 'insensitive'
            }
        },
        select: { id: true, name: true, username: true, status: true }
    })

    if (!user || user.status === 'SUSPENDED') {
        notFound()
    }

    const teacherName = user.name || user.username

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date)
    }

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(date)
    }

    let slots: SlotWithCount[] = []
    let events: any[] = []
    let error = null

    try {
        const [slotsData, eventsData] = await Promise.all([
            prisma.slot.findMany({
                where: { createdById: user.id },
                orderBy: { startTime: 'asc' },
                include: {
                    _count: { select: { signups: true } },
                    signups: { select: { id: true, attendeeCount: true } },
                    createdBy: { select: { name: true, username: true } }
                },
            }),
            prisma.eventPage.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { slots: true } }
                }
            })
        ])
        slots = slotsData.map(slot => ({
            ...slot,
            signups: slot.signups || [],
            _count: slot._count
        }))

        events = eventsData
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
                            <p className="text-lg text-gray-600 mt-1">Sign-Ups</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events List */}
            {events.length > 0 && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((event) => (
                            <a
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group"
                            >
                                {event.imageUrl && (
                                    <div className="h-48 overflow-hidden">
                                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                                    {event.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                                    )}
                                    <div className="flex items-center text-sm text-gray-500 font-medium">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                            {event._count.slots} {event._count.slots === 1 ? 'Slot' : 'Slots'} Available
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Slots List */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-4">
                    {slots.map((slot) => (
                        <SlotCard key={slot.id} slot={slot} />
                    ))}

                    {slots.length === 0 && (
                        <div className="text-center py-20 bg-white border border-gray-200 border-dashed rounded-xl">
                            <p className="text-slate-500">No signup slots are currently available for this teacher.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
