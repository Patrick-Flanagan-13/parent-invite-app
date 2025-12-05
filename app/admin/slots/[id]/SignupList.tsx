'use client'

import { useTransition, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import { cancelSignup } from '@/app/actions'

type Signup = {
    id: string
    parentName: string
    childName: string | null
    email: string
    createdAt: Date
    attendeeCount: number
}

import { useState } from 'react'

function RemoveButton({ onConfirm, isPending }: { onConfirm: () => void, isPending: boolean }) {
    const [needsConfirm, setNeedsConfirm] = useState(false)

    if (needsConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                <button
                    onClick={() => onConfirm()}
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Removing...' : 'Confirm'}
                </button>
                <button
                    onClick={() => setNeedsConfirm(false)}
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setNeedsConfirm(true)}
            disabled={isPending}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
        >
            Remove
        </button>
    )
}

export default function SignupList({ signups, onRemove }: { signups: Signup[], onRemove?: (id: string) => void }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [optimisticSignups, removeOptimisticSignup] = useOptimistic(
        signups,
        (state, idToRemove: string) => state.filter(s => s.id !== idToRemove)
    )

    const handleRemove = (id: string) => {
        if (onRemove) {
            onRemove(id)
            return
        }

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

    if (optimisticSignups.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No parents have signed up for this slot yet.</p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
            <ul className="divide-y divide-gray-100">
                {optimisticSignups.map((signup) => (
                    <li key={signup.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group min-h-[80px]">
                        <div>
                            <div className="font-bold text-gray-900">{signup.parentName}</div>
                            <div className="text-sm text-gray-600">
                                {signup.childName && <span className="mr-2">Child: {signup.childName}</span>}
                                <span className="text-gray-400">•</span>
                                <span className="ml-2">{signup.email}</span>
                                <span className="text-gray-400">•</span>
                                <span className="ml-2 font-medium text-blue-600">
                                    {signup.attendeeCount} {signup.attendeeCount === 1 ? 'Slot' : 'Slots'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Registered {new Date(signup.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <RemoveButton onConfirm={() => handleRemove(signup.id)} isPending={isPending} />
                    </li>
                ))}
            </ul>
        </div>
    )
}
