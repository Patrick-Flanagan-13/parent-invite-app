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
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
            title="Remove User"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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

        <div className="space-y-3">
            {optimisticSignups.map((signup) => (
                <div key={signup.id} className="group relative flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {signup.parentName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{signup.parentName}</div>
                            <div className="text-sm text-gray-500">
                                {signup.email}
                                {signup.childName && <span className="ml-2">• Child: {signup.childName}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-500">
                            {signup.attendeeCount} {signup.attendeeCount === 1 ? 'Guest' : 'Guests'}
                        </div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <RemoveButton onConfirm={() => handleRemove(signup.id)} isPending={isPending} />
                    </div>
                </div>
            ))}
        </div>
    )
}

