'use client'

import { useState } from 'react'
import AdminSlotCardNew from './AdminSlotCardNew'
import AdminSlotCardOriginal from './AdminSlotCardOriginal'
import { Slot } from '@prisma/client'

type SlotWithDetails = Slot & {
    _count: { signups: number },
    signups: { id: string, parentName: string, childName: string | null, email: string, createdAt: Date, attendeeCount: number }[],
    createdBy?: { username: string, name: string | null } | null
    template?: { name: string } | null
}

export default function AdminSlotList({ slots, isAdmin }: { slots: SlotWithDetails[], isAdmin: boolean }) {
    const [useNewDesign, setUseNewDesign] = useState(true)

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                            {slots.length} {slots.length === 1 ? 'Slot' : 'Slots'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setUseNewDesign(false)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!useNewDesign
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Classic
                        </button>
                        <button
                            onClick={() => setUseNewDesign(true)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${useNewDesign
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            New Design
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {slots.map((slot) => (
                    <div key={slot.id} className="p-4">
                        {useNewDesign ? (
                            <AdminSlotCardNew slot={slot} isAdmin={isAdmin} />
                        ) : (
                            <AdminSlotCardOriginal slot={slot} isAdmin={isAdmin} />
                        )}
                    </div>
                ))}
                {slots.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Slots Found</h3>
                        <p className="text-gray-600">
                            {isAdmin
                                ? "No slots have been created yet."
                                : "You haven't created any time slots yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
