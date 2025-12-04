'use client'

import { useActionState } from 'react'
import { updateSlot } from '@/app/actions'

type EventPage = {
    id: string
    title: string
}

const initialState = {
    success: false,
    message: ''
}

export default function EditSlotForm({ slot, events }: { slot: any, events: EventPage[] }) {
    const [state, action, isPending] = useActionState(updateSlot, initialState)

    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const formatDate = (date: Date) => {
        return new Date(date).toISOString().slice(0, 16)
    }

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="id" value={slot.id} />

            {state.message && (
                <div className={`p-4 rounded-xl ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Slot Name</label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={slot.name || ''}
                        placeholder="e.g., Parent Conference"
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Event</label>
                    <select
                        name="eventPageId"
                        defaultValue={slot.eventPageId || ''}
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                    >
                        <option value="">-- General / No Event --</option>
                        {events.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                    <input
                        type="datetime-local"
                        name="startTime"
                        defaultValue={formatDate(slot.startTime)}
                        required
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                    <input
                        type="datetime-local"
                        name="endTime"
                        defaultValue={formatDate(slot.endTime)}
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional if "Hide End Time" is checked.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Capacity</label>
                    <input
                        type="number"
                        name="maxCapacity"
                        min="1"
                        defaultValue={slot.maxCapacity}
                        required
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Donation Link (Optional)</label>
                    <input
                        type="url"
                        name="donationLink"
                        defaultValue={slot.donationLink || ''}
                        placeholder="e.g., https://amazon.com/..."
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 transition-all"
                    />
                </div>
                <div className="flex items-center h-full pt-6 space-x-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="hideTime"
                            defaultChecked={slot.hideTime}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm font-bold text-gray-700">Hide Time</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="hideEndTime"
                            defaultChecked={slot.hideEndTime}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm font-bold text-gray-700">Hide End Time</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <a
                    href="/admin"
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                    Cancel
                </a>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}
