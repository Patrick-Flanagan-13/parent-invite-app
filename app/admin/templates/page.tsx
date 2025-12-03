import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createTemplate, deleteTemplate, updateTemplate } from './actions'
import DeleteTemplateButton from './DeleteTemplateButton'
import TemplateForm from './TemplateForm'

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
                    <TemplateForm />
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
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/admin/templates/${template.id}`}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        title="Edit Template"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>
                                    <DeleteTemplateButton id={template.id} />
                                </div>
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
