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

export default function SignupList({ signups }: { signups: Signup[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [optimisticSignups, removeOptimisticSignup] = useOptimistic(
        signups,
        (state, idToRemove: string) => state.filter(s => s.id !== idToRemove)
    )

    const handleRemove = (id: string) => {
        if (confirm('Are you sure you want to remove this parent from the slot?')) {
            startTransition(async () => {
                removeOptimisticSignup(id)
                try {
                    await cancelSignup(id)
                    router.refresh()
                } catch (e) {
                    alert('Failed to remove signup')
                    // In a real app we might want to revert the optimistic update here,
                    // but useOptimistic handles resets automatically when the server action finishes/fails
                    // if we re-validate. However, since we filter out, if it fails and we don't refresh,
                    // it might look gone. But router.refresh() will re-fetch the true state.
                }
            })
        }
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
                    <li key={signup.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
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
                        <button
                            onClick={() => handleRemove(signup.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                        >
                            {isPending ? 'Removing...' : 'Remove'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
