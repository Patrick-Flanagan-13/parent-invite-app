'use client'

import { useActionState } from 'react'
import { createEvent, updateEvent } from './actions'

const initialState = {
    message: '',
    error: ''
}

export default function EventForm({ event }: { event?: any }) {
    const [state, formAction, isPending] = useActionState(event ? updateEvent : createEvent, initialState)

    return (
        <form action={formAction} className="space-y-6">
            {event && <input type="hidden" name="id" value={event.id} />}

            {state?.message && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center animate-in fade-in slide-in-from-top-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {state.message}
                </div>
            )}

            {state?.error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center animate-in fade-in slide-in-from-top-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    defaultValue={event?.title}
                    placeholder="e.g., Fall Conference"
                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                    name="description"
                    rows={3}
                    defaultValue={event?.description}
                    placeholder="Brief description of the event..."
                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                    type="url"
                    name="imageUrl"
                    defaultValue={event?.imageUrl}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                />
                <p className="text-xs text-gray-500 mt-1">Provide a direct link to an image to display on the event page.</p>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isPending ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : (
                    event ? 'Save Changes' : 'Create Event'
                )}
            </button>
        </form>
    )
}
