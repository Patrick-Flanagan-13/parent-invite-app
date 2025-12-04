import { Slot } from '@prisma/client'
import SignupForm from '../SignupForm'
import DonationLink from '../teachers/[username]/DonationLink'

type SlotWithCount = Slot & {
    _count: { signups: number }
    name?: string | null
    description?: string | null
    donationLink?: string | null
    collectContributing?: boolean
    collectDonating?: boolean
    displayNameAsTitle: boolean
    hideTime: boolean
    hideEndTime: boolean
}

export default function SlotCard({ slot }: { slot: SlotWithCount }) {
    const isFull = slot._count.signups >= slot.maxCapacity

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(date))
    }

    return (
        <details className="group bg-white border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors rounded-xl shadow-sm">
            <summary className="list-none cursor-pointer p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-100 text-slate-900 rounded-lg">
                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(slot.startTime).toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-bold">{new Date(slot.startTime).getDate()}</span>
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                            {(slot.displayNameAsTitle || slot.hideTime) && slot.name ? (
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-900">{slot.name}</h3>
                                    {!slot.hideTime && (
                                        <span className="text-sm text-slate-500 font-medium">
                                            {formatTime(slot.startTime)}
                                            {!slot.hideEndTime && ` - ${formatTime(slot.endTime)}`}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    {!slot.hideTime && (
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {formatTime(slot.startTime)}
                                            {!slot.hideEndTime && ` - ${formatTime(slot.endTime)}`}
                                        </h3>
                                    )}
                                    {slot.name && (
                                        <span className="text-lg font-medium text-slate-700">
                                            {slot.name}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {slot.description && <p className="text-slate-500 text-sm mt-1">{slot.description}</p>}
                        {slot.donationLink && (
                            <DonationLink href={slot.donationLink} />
                        )}
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
                            collectContributing={slot.collectContributing || false}
                            collectDonating={slot.collectDonating || false}
                        />
                    </div>
                </div>
            )}
        </details>
    )
}
