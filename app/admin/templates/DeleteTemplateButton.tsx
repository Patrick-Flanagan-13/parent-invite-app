'use client'

import { deleteTemplate } from './actions'

export default function DeleteTemplateButton({ id }: { id: string }) {
    return (
        <form
            action={async () => {
                if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
                    await deleteTemplate(id)
                }
            }}
        >
            <button
                type="submit"
                className="text-red-600 hover:text-red-900 font-medium"
            >
                Delete
            </button>
        </form>
    )
}
