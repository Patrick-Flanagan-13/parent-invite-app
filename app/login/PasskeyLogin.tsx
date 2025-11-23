'use client'

import { startAuthentication } from '@simplewebauthn/browser'
import { generateAuthenticationOptionsAction, verifyAuthenticationAction } from '@/app/actions/passkeys'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PasskeyLogin() {
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // 1. Get options from server
            const options = await generateAuthenticationOptionsAction(username)

            // 2. Pass options to browser API
            const asseResp = await startAuthentication({ optionsJSON: options })

            // 3. Send response to server for verification
            const verification = await verifyAuthenticationAction(asseResp)

            if (verification.success) {
                router.push('/admin') // Redirect to admin dashboard
                router.refresh()
            } else {
                setError('Verification failed.')
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'An error occurred during passkey login.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-6 border-t pt-6">
            <h3 className="text-center text-sm font-semibold text-gray-500 mb-4">OR SIGN IN WITH PASSKEY</h3>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="passkey-username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="passkey-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                        placeholder="Enter username"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Sign in with Passkey 🔑'}
                </button>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
        </div>
    )
}
