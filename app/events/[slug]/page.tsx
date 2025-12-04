import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import SignupForm from '../../SignupForm'
import DonationLink from '../../teachers/[username]/DonationLink'
import SlotCard from '@/app/components/SlotCard'

export const dynamic = 'force-dynamic'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const event = await prisma.eventPage.findUnique({
        where: { slug },
        include: {
            user: { select: { name: true, username: true } },
            slots: {
                orderBy: { startTime: 'asc' },
                include: {
                    _count: { select: { signups: true } }
                }
            }
        }
    })

    if (!event) {
        notFound()
    }

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

    const teacherName = event.user.name || event.user.username

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
                </div>
            </header>

            {/* Event Hero */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {event.imageUrl && (
                        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg max-h-96">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700 mb-4">
                                Event
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                            {event.description && (
                                <p className="text-xl text-gray-600 max-w-3xl">{event.description}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Organized by</p>
                            <p className="text-lg font-bold text-gray-900">{teacherName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slots List */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Time Slots</h2>

                <div className="space-y-4">
                    {event.slots.map((slot: any) => (
                        <SlotCard key={slot.id} slot={slot} />
                    ))}

                    {event.slots.length === 0 && (
                        <div className="text-center py-20 bg-white border border-gray-200 border-dashed rounded-xl">
                            <p className="text-slate-500">No time slots have been added to this event yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
