'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import SlotCard from '@/app/components/SlotCard'
import SignupList from './slots/[id]/SignupList'
import DeleteSlotButton from './DeleteSlotButton'
import { cancelSignup } from '@/app/actions'
import { Slot } from '@prisma/client'

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

    return (
        <SlotCard
            slot={slot}
            signupsList={optimisticSignups}
            shouldFetch={false}
            adminControls={
                <>
                    <a
                        href={`/admin/slots/${slot.id}`}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 transition-all duration-200"
                    >
                        Edit
                    </a>
                    <DeleteSlotButton id={slot.id} />
                </>
            }
        >
            <div className="space-y-4">
                {isAdmin && slot.createdBy && (
                    <p className="text-sm text-gray-500">
                        Created by: <span className="font-semibold text-gray-900">{slot.createdBy.name || slot.createdBy.username}</span>
                    </p>
                )}

                {optimisticSignups.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700">Registered Parents</h4>
                        </div>
                        <SignupList signups={optimisticSignups} onRemove={handleRemove} />
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No parents have registered for this slot yet.</p>
                )}
            </div>
        </SlotCard>
    )
}
