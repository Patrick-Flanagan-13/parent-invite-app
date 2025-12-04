'use client'

import { useState, useEffect } from 'react'
import { signupForSlot } from './actions'

export default function SignupForm({ slotId, collectContributing, collectDonating, onClose, maxAttendees = 1 }: { slotId: string, collectContributing?: boolean, collectDonating?: boolean, onClose?: () => void, maxAttendees?: number }) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    // State for form fields to enable pre-filling
    const [formData, setFormData] = useState({
        parentName: '',
        childName: '',
        email: '',
        attendeeCount: '1'
    })

    // Load saved details from localStorage on mount
    useEffect(() => {
        const savedParentName = localStorage.getItem('parentName')
        const savedChildName = localStorage.getItem('childName')
        const savedEmail = localStorage.getItem('email')

        if (savedParentName || savedChildName || savedEmail) {
            setFormData({
                parentName: savedParentName || '',
                childName: savedChildName || '',
                email: savedEmail || '',
                attendeeCount: '1'
            })
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(formDataObj: FormData) {
        setStatus('submitting')
        setErrorMessage('')

        try {
            // Save details to localStorage for next time
            localStorage.setItem('parentName', formData.parentName)
            localStorage.setItem('childName', formData.childName)
            localStorage.setItem('email', formData.email)

            // We need to append the slotId since it's not in the form inputs anymore if we pass it as prop
            // But wait, we can just add a hidden input or append it to formData
            formDataObj.append('slotId', slotId)
            formDataObj.set('attendeeCount', formData.attendeeCount)

            await signupForSlot(formDataObj)
            setStatus('success')
        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setErrorMessage(error.message || 'Something went wrong. Please try again.')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-50 rounded-xl p-8 text-center border-2 border-green-100 animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Registration Confirmed!</h3>
                <p className="text-green-700 mb-6">
                    You have successfully signed up for this slot. A confirmation email has been sent to you.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                    >
                        Done
                    </button>

                    <button
                        onClick={() => {
                            setStatus('idle')
                            setFormData(prev => ({ ...prev, childName: '' })) // Clear child name for next entry
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white border border-green-200 rounded-lg text-green-700 font-medium hover:bg-green-50 hover:border-green-300 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Register Sibling
                    </button>
                </div>

                <p className="mt-4 text-sm text-green-600/80">
                    Click <strong>Done</strong> to choose another time slot for the same child.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-b-2xl shadow-lg px-6 py-8 sm:px-8 -mt-2 border-t-2 border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Complete Your Registration
            </h4>

            {status === 'error' && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                    <p className="text-red-700 font-medium">{errorMessage}</p>
                </div>
            )}

            <form action={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="parentName"
                            name="parentName"
                            required
                            value={formData.parentName}
                            onChange={handleChange}
                            disabled={status === 'submitting'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                            Child's Name
                        </label>
                        <input
                            type="text"
                            id="childName"
                            name="childName"
                            value={formData.childName}
                            onChange={handleChange}
                            disabled={status === 'submitting'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Jane Doe"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            disabled={status === 'submitting'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="attendeeCount" className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Slots/Parents <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="attendeeCount"
                            name="attendeeCount"
                            required
                            min="1"
                            max={maxAttendees}
                            value={formData.attendeeCount}
                            onChange={handleChange}
                            disabled={status === 'submitting'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {maxAttendees} {maxAttendees === 1 ? 'spot' : 'spots'} available
                        </p>
                    </div>
                </div>

                {collectContributing && (
                    <div>
                        <label htmlFor={`contribution-${slotId}`} className="block text-sm font-semibold text-gray-700 mb-2">
                            Contributing
                        </label>
                        <input
                            type="text"
                            name="contribution"
                            id={`contribution-${slotId}`}
                            disabled={status === 'submitting'}
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all disabled:opacity-60 disabled:bg-gray-50"
                            placeholder="How would you like to contribute?"
                        />
                    </div>
                )}

                {collectDonating && (
                    <div>
                        <label htmlFor={`donation-${slotId}`} className="block text-sm font-semibold text-gray-700 mb-2">
                            Donating
                        </label>
                        <input
                            type="text"
                            name="donation"
                            id={`donation-${slotId}`}
                            disabled={status === 'submitting'}
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all disabled:opacity-60 disabled:bg-gray-50"
                            placeholder="Donation details (optional)"
                        />
                    </div>
                )}
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {status === 'submitting' ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Registration
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
