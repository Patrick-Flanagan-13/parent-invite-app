import { prisma } from '@/lib/db'
import SignupForm from '../SignupForm'
import { Slot } from '@prisma/client'

export const dynamic = 'force-dynamic'

type SlotWithCount = Slot & {
    _count: { signups: number }
    name?: string | null
    description?: string | null
    collectContributing?: boolean
    collectDonating?: boolean
}

export default async function HomeDesign3() {
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
            <div className="min-h-screen flex items-center justify-center bg-violet-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-violet-900 mb-2">System Unavailable</h1>
                    <p className="text-violet-700">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Vibrant Hero */}
            <div className="relative bg-indigo-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                        alt="School Exterior"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 to-indigo-900/90"></div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="flex justify-between items-start">
                        <div className="max-w-3xl">
                            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-6 tracking-tighter">
                                PARENT<br />TEACHER<br />CONNECT
                            </h1>
                            <p className="text-xl text-indigo-100 font-medium max-w-xl leading-relaxed">
                                San Ramon Unified School District invites you to participate in our seasonal conferences. Let's shape the future together.
                            </p>
                        </div>
                        <a href="/login" className="hidden md:inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all">
                            Staff Access →
                        </a>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slots.map((slot) => {
                        const isFull = slot._count.signups >= slot.maxCapacity
                        // @ts-ignore
                        const teacherName = slot.createdBy?.name || slot.createdBy?.username || 'Unknown Teacher'
                        const spotsLeft = slot.maxCapacity - slot._count.signups

                        return (
                            <div key={slot.id} className={`relative group bg-white rounded-3xl p-1 transition-all hover:-translate-y-1 hover:shadow-2xl ${isFull ? 'opacity-75' : ''}`}>
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${isFull ? 'from-gray-200 to-gray-300' : 'from-violet-500 to-fuchsia-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                                <div className="relative h-full bg-white rounded-[20px] p-6 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-gray-50 rounded-2xl p-3 text-center min-w-[70px]">
                                            <div className="text-xs font-bold text-gray-400 uppercase">
                                                {new Date(slot.startTime).toLocaleString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className="text-2xl font-black text-gray-900">
                                                {new Date(slot.startTime).getDate()}
                                            </div>
                                        </div>
                                        {!isFull && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                {spotsLeft} Spots
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {slot.name || 'Conference Session'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                        {slot.description || 'Join us for a discussion about student progress.'}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {teacherName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{teacherName}</span>
                                            </div>
                                            <div className="text-right text-xs font-bold text-gray-400">
                                                {new Date(slot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <details className="group/details">
                                            <summary className={`w-full py-3 rounded-xl text-center font-bold cursor-pointer transition-colors list-none ${isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-indigo-600'}`}>
                                                {isFull ? 'Fully Booked' : 'Book Now'}
                                            </summary>
                                            {!isFull && (
                                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                                                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                                                        <div className="absolute top-4 right-4">
                                                            {/* Close Icon - clicking summary again closes it */}
                                                        </div>
                                                        <h4 className="text-2xl font-bold mb-6">Complete Registration</h4>
                                                        <SignupForm
                                                            slotId={slot.id}
                                                            collectContributing={slot.collectContributing}
                                                            collectDonating={slot.collectDonating}
                                                        />
                                                        <p className="text-center text-xs text-gray-400 mt-4">Click the button again to close if you change your mind.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </details>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
