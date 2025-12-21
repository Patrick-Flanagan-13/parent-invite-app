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

            if ((options as any).error) {
                throw new Error((options as any).error)
            }

            // 2. Pass options to browser API
            const asseResp = await startAuthentication({ optionsJSON: options as any })

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
            if (err.message && err.message.includes('Authenticator not found')) {
                setError('Passkey not recognized. Please sign in with password.')
            } else {
                setError(err.message || 'An error occurred during passkey login.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium uppercase tracking-wider">Or sign in with passkey</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="passkey-username" className="block text-sm font-bold text-gray-700 mb-2">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="passkey-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="Enter your username"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : (
                        <>
                            Sign in with Passkey
                            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M8 8a8 8 0 004.168.662m4.832 15.225a21.88 21.88 0 00-2.66-6.844" />
                            </svg>
                        </>
                    )}
                </button>
                {error && (
                    <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                        <div className="flex items-center justify-center">
                            <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-semibold text-red-800">{error}</p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
