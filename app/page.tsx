import { prisma } from '@/lib/db'
import SignupForm from './SignupForm'
import { Slot } from '@prisma/client'

export const dynamic = 'force-dynamic'

type SlotWithCount = Slot & {
    _count: { signups: number }
    name?: string | null
    description?: string | null
    collectContributing?: boolean
    collectDonating?: boolean
}

export default async function Home() {
    let slots: SlotWithCount[] = []
    let error = null

    try {
        slots = await prisma.slot.findMany({
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
            {/* Modern Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-900 text-xl tracking-tight">Quail Run Elementary</span>
                    </div>
                    <a href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Teacher Login
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative bg-slate-900 h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/san-ramon-hills.jpg"
                        alt="San Ramon Hills"
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-3xl">
                        Parent-Teacher Conferences
                    </h1>
                    <p className="text-xl text-slate-200 max-w-2xl font-light">
                        Schedule your meeting efficiently. Connect with educators to support your child's growth in a modern learning environment.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Sessions</h2>
                    <div className="text-sm text-slate-500">
                        {slots.length} slots available
                    </div>
                </div>

                <div className="grid gap-4">
                    {slots.map((slot) => {
                        const isFull = slot._count.signups >= slot.maxCapacity
                        // @ts-ignore
                        const teacherName = slot.createdBy?.name || slot.createdBy?.username || 'Unknown Teacher'

                        return (
                            <details key={slot.id} className="group bg-white border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors">
                                <summary className="list-none cursor-pointer p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-100 text-slate-900">
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
                                            <p className="text-slate-500 text-sm">Teacher: <span className="font-medium text-slate-900">{teacherName}</span></p>
                                            {slot.description && <p className="text-slate-400 text-sm mt-1">{slot.description}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className={`text - sm font - medium ${isFull ? 'text-red-600' : 'text-emerald-600'} `}>
                                            {isFull ? 'Fully Booked' : `${slot.maxCapacity - slot._count.signups} spots open`}
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
                        <div className="text-center py-20 bg-white border border-gray-200 border-dashed">
                            <p className="text-slate-500">No conference slots are currently available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
