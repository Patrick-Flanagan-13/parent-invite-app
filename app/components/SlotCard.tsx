'use client'

import { Slot } from '@prisma/client'
import SignupForm from '../SignupForm'
import DonationLink from '../teachers/[username]/DonationLink'
import { ReactNode, useState, useEffect } from 'react'
import { getSlotDetails } from '../actions'

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

export default function SlotCard({
    slot,
    signupsList,
    adminControls,
    children
}: {
    slot: SlotWithCount,
    signupsList?: any[],
    adminControls?: ReactNode,
    children?: ReactNode
}) {
    const [fetchedSignups, setFetchedSignups] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Fetch fresh data on mount to ensure accuracy
        getSlotDetails(slot.id).then(result => {
            if (result.success && result.slot) {
                setFetchedSignups(result.slot.signups)
            }
            setIsLoading(false)
        })
    }, [slot.id])

    // Prioritize fetched data, then prop, then slot object
    const effectiveSignups = fetchedSignups || signupsList || slot.signups

    const totalAttendees = Array.isArray(effectiveSignups)
        ? effectiveSignups.reduce((sum: number, s: any) => sum + (s.attendeeCount || 1), 0)
        : slot._count.signups

    const isFull = totalAttendees >= slot.maxCapacity
    const spotsOpen = slot.maxCapacity - totalAttendees

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(date))
    }

    const [isOpen, setIsOpen] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    return (
        <details
            className="group bg-white border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors rounded-xl shadow-sm"
            open={isOpen}
            onToggle={(e) => setIsOpen(e.currentTarget.open)}
        >
            <summary
                className="list-none cursor-pointer p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={(e) => {
                    e.preventDefault()
                    setIsOpen(!isOpen)
                }}
            >
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-100 text-slate-900 rounded-lg shrink-0">
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

                <div className="flex items-center gap-6 self-end md:self-auto">
                    {!isSuccess && (
                        <div className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isLoading ? (
                                <span className="text-gray-400">Loading...</span>
                            ) : (
                                isFull ? 'Fully Booked' : `${spotsOpen} ${spotsOpen === 1 ? 'spot' : 'spots'} open`
                            )}

                        </div>
                    )}

                    {adminControls && (
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                            {adminControls}
                        </div>
                    )}

                    <div className="w-8 h-8 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </summary>

            <div className="p-6 pt-0 border-t border-gray-100 mt-4 bg-slate-50/50">
                <div className="max-w-2xl mx-auto py-8">
                    {isOpen && (children ? children : (
                        !isFull && (
                            <SignupForm
                                slotId={slot.id}
                                maxAttendees={spotsOpen}
                                collectContributing={slot.collectContributing || false}
                                collectDonating={slot.collectDonating || false}
                                onClose={() => setIsOpen(false)}
                                onSuccess={() => setIsSuccess(true)}
                            />
                        )
                    ))}
                </div>
            </div>
        </details>
    )
}
