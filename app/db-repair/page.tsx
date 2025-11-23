'use client'

import { useState } from 'react'
import { checkDatabaseStatus, fixDatabaseSchema } from './actions'

export default function DbToolsPage() {
    const [status, setStatus] = useState<any>(null)
    const [fixResult, setFixResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    async function handleCheck() {
        setLoading(true)
        const result = await checkDatabaseStatus()
        setStatus(result)
        setLoading(false)
    }

    async function handleFix() {
        setLoading(true)
        const result = await fixDatabaseSchema()
        setFixResult(result)
        setLoading(false)
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Repair Tools</h1>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">1. Diagnose Schema</h2>
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Check User Table Columns
                    </button>

                    {status && (
                        <div className="mt-4 p-4 bg-gray-50 rounded overflow-auto max-h-60">
                            <pre className="text-xs">{JSON.stringify(status, null, 2)}</pre>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">2. Apply Fixes</h2>
                    <p className="text-gray-600 mb-4">
                        This will attempt to manually add the missing columns (name, role, status) to the User table.
                    </p>
                    <button
                        onClick={handleFix}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Run Schema Fix
                    </button>

                    {fixResult && (
                        <div className={`mt-4 p-4 rounded ${fixResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {fixResult.success ? fixResult.message : fixResult.error}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">3. Fix Login Issues</h2>
                    <p className="text-gray-600 mb-4">
                        If users created before the fix cannot login, run this to convert all usernames to lowercase.
                    </p>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            const { normalizeUsernames } = await import('./actions')
                            const result = await normalizeUsernames()
                            setFixResult(result)
                            setLoading(false)
                        }}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        Normalize Usernames
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">4. Inspect Users</h2>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            const { listUsers } = await import('./actions')
                            const result = await listUsers()
                            setStatus(result) // Reuse status display
                            setLoading(false)
                        }}
                        disabled={loading}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                        List All Users
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">5. Fix Slot Table</h2>
                    <p className="text-gray-600 mb-4">
                        If you're seeing a grey screen, run this to add the missing createdById column to the Slot table.
                    </p>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            const { fixSlotSchema } = await import('./actions')
                            const result = await fixSlotSchema()
                            setFixResult(result)
                            setLoading(false)
                        }}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        Fix Slot Table Schema
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">6. Fix Signup Table (Email Confirmations)</h2>
                    <p className="text-gray-600 mb-4">
                        Adds cancellation tokens to the Signup table for email confirmation feature.
                    </p>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            const { fixSignupSchema } = await import('./actions')
                            const result = await fixSignupSchema()
                            setFixResult(result)
                            setLoading(false)
                        }}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        Fix Signup Table Schema
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">7. Fix Child Name Field</h2>
                    <p className="text-gray-600 mb-4">
                        Adds the childName column to the Signup table and sets a default value for existing records.
                    </p>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            const { addChildNameToSignups } = await import('./child-name-repair')
                            const result = await addChildNameToSignups()
                            setFixResult(result)
                            setLoading(false)
                        }}
                        disabled={loading}
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                        Add Child Name Column
                    </button>
                </div>
            </div>
        </div>
    )
}
