'use client'

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
}

export default function TemplateForm({ template }: { template?: Template }) {
    return (
        <form action={template ? updateTemplate : createTemplate} className="space-y-6">
            {template && <input type="hidden" name="id" value={template.id} />}

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

            <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
            >
                {template ? 'Save Changes' : 'Create Template'}
            </button>
        </form>
    )
}
