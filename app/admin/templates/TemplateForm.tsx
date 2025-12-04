'use client'

import { useActionState } from 'react'
import { createTemplate, updateTemplate } from './actions'

type Template = {
    id: string
    name: string
    description: string | null
    collectDonationLink: boolean
    collectContributing: boolean
    collectDonating: boolean
    displayNameAsTitle: boolean
    hideEndTime: boolean
    isDefault: boolean
    confirmationEmailSubject?: string | null
    confirmationEmailBody?: string | null
    reminderEmailSubject?: string | null
    reminderEmailBody?: string | null
}

const initialState = {
    success: false,
    message: ''
}

export default function TemplateForm({ template }: { template?: Template }) {
    const [state, action, isPending] = useActionState(template ? updateTemplate : createTemplate, initialState)

    return (
        <form action={action} className="space-y-6">
            {template && <input type="hidden" name="id" value={template.id} />}

            {state.message && (
                <div className={`p-4 rounded-xl ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        defaultValue={template?.name}
                        placeholder="e.g., Morning Conference"
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        defaultValue={template?.description || ''}
                        placeholder="e.g., 15-minute session"
                        className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="collectDonationLink"
                        defaultChecked={template?.collectDonationLink}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Allow Donation Link</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="displayNameAsTitle"
                        defaultChecked={template?.displayNameAsTitle}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Display Name as Title</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="collectContributing"
                        defaultChecked={template?.collectContributing}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Collect "Contributing" Info</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="collectDonating"
                        defaultChecked={template?.collectDonating}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Collect "Donating" Info</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="hideEndTime"
                        defaultChecked={template?.hideEndTime}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Hide End Time</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isDefault"
                        defaultChecked={template?.isDefault}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">Set as Default</span>
                </label>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Email Settings</h3>
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-3">Confirmation Email</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-1">Subject Line</label>
                                <input
                                    type="text"
                                    name="confirmationEmailSubject"
                                    defaultValue={template?.confirmationEmailSubject || ''}
                                    placeholder="Time Confirmed!"
                                    className="block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-1">Email Body</label>
                                <textarea
                                    name="confirmationEmailBody"
                                    rows={4}
                                    defaultValue={template?.confirmationEmailBody || ''}
                                    placeholder="Your parent-teacher conference for {{childName}} has been confirmed..."
                                    className="block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-blue-600">Available variables: {'{{parentName}}'}, {'{{childName}}'}, {'{{teacherName}}'}, {'{{startTime}}'}, {'{{endTime}}'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h4 className="font-semibold text-purple-900 mb-3">Reminder Email</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-purple-800 mb-1">Subject Line</label>
                                <input
                                    type="text"
                                    name="reminderEmailSubject"
                                    defaultValue={template?.reminderEmailSubject || ''}
                                    placeholder="Conference Reminder"
                                    className="block w-full rounded-lg border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-800 mb-1">Email Body</label>
                                <textarea
                                    name="reminderEmailBody"
                                    rows={4}
                                    defaultValue={template?.reminderEmailBody || ''}
                                    placeholder="This is a reminder that you have a conference for {{childName}}..."
                                    className="block w-full rounded-lg border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                />
                                <p className="mt-1 text-xs text-purple-600">Available variables: {'{{parentName}}'}, {'{{childName}}'}, {'{{teacherName}}'}, {'{{startTime}}'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Saving...' : (template ? 'Save Changes' : 'Create Template')}
            </button>
        </form>
    )
}
