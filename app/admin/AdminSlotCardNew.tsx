'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import SignupList from './slots/[id]/SignupList'
import DeleteSlotButton from './DeleteSlotButton'
import { cancelSignup } from '@/app/actions'
import { Slot } from '@prisma/client'
import { formatSlotDateTime } from '@/lib/date-utils'

type SlotWithDetails = Slot & {
    _count: { signups: number },
    signups: { id: string, parentName: string, childName: string | null, email: string, createdAt: Date, attendeeCount: number }[],
    createdBy?: { username: string, name: string | null } | null
    template?: { name: string } | null
}

export default function AdminSlotCard({ slot, isAdmin }: { slot: SlotWithDetails, isAdmin: boolean }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [optimisticSignups, removeOptimisticSignup] = useOptimistic(
        slot.signups,
        (state, idToRemove: string) => state.filter(s => s.id !== idToRemove)
    )

    const handleRemove = (id: string) => {
        startTransition(async () => {
            removeOptimisticSignup(id)
            try {
                await cancelSignup(id)
                router.refresh()
            } catch (e) {
                alert('Failed to remove signup')
            }
        })
    }

    const totalAttendees = optimisticSignups.reduce((sum, s) => sum + (s.attendeeCount || 1), 0)
    const capacityPercentage = Math.min((totalAttendees / slot.maxCapacity) * 100, 100)
    const { dateStr, timeStr } = formatSlotDateTime(slot.startTime, slot.endTime)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
            {/* Header Section */}
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {slot.name || 'Untitled Slot'}
                    </h3>
                    <div className="flex gap-2">
                        <a
                            href={`/admin/slots/${slot.id}`}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Edit
                        </a>
                        <DeleteSlotButton id={slot.id} />
                    </div>
                </div>
                <div className="text-gray-500 text-sm">
                    {dateStr} • {timeStr}
                    {isAdmin && slot.createdBy && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            Created by {slot.createdBy.name || slot.createdBy.username}
                        </span>
                    )}
                </div>
            </div>

            {/* Capacity / Budget Section */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-medium text-gray-700">Capacity</label>
                    <div className="text-2xl font-bold text-gray-900 leading-none">
                        {totalAttendees} <span className="text-gray-400 text-lg font-medium">/ {slot.maxCapacity}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full ${capacityPercentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                        style={{ width: `${capacityPercentage}%` }}
                    />
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    {slot.maxCapacity - totalAttendees} spots remaining
                </div>
            </div>

            {/* Signups List Section */}
            <div className="pt-2">
                <SignupList signups={optimisticSignups} onRemove={handleRemove} />
            </div>
        </div>
    )
}
