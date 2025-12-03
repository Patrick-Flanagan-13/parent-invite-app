import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createTemplate, deleteTemplate, updateTemplate } from './actions'
import DeleteTemplateButton from './DeleteTemplateButton'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin')
    }

    // @ts-ignore
    const templates = await prisma.slotTemplate.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Slot Templates</h1>
                    <a href="/admin" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        ← Back to Dashboard
                    </a>
                </div>

                {/* Create Template Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Template</h2>
                    <form action={createTemplate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g., Morning Conference"
                                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="e.g., 15-minute session"
                                    className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-4 py-3"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="collectDonationLink" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                                <span className="text-gray-700 font-medium">Allow Donation Link</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="displayNameAsTitle" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                                <span className="text-gray-700 font-medium">Display Name as Title</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="collectContributing" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                                <span className="text-gray-700 font-medium">Collect "Contributing" Info</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="collectDonating" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                                <span className="text-gray-700 font-medium">Collect "Donating" Info</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="isDefault" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                                <span className="text-gray-700 font-medium">Set as Default</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            Create Template
                        </button>
                    </form>
                </div>

                {/* Templates List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template: any) => (
                        <div key={template.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                                    {template.isDefault && (
                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mt-1">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <DeleteTemplateButton id={template.id} />
                            </div>

                            <p className="text-gray-600 text-sm mb-4">{template.description || 'No description'}</p>

                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${template.collectContributing ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    Contributing: {template.collectContributing ? 'Yes' : 'No'}
                                </div>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${template.collectDonating ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    Donating: {template.collectDonating ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
