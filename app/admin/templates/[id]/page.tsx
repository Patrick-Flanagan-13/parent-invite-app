import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import TemplateForm from '../TemplateForm'

export const dynamic = 'force-dynamic'

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin')
    }

    const { id } = await params
    const template = await prisma.slotTemplate.findUnique({
        where: { id }
    })

    if (!template) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
                    <a href="/admin/templates" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        ← Back to Templates
                    </a>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <TemplateForm template={template} />
                </div>
            </div>
        </div>
    )
}
