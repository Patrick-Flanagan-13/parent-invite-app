'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, checkUsernameAvailability } from './actions'
import { getPasswordRequirements } from '@/lib/password'

export default function SignupPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [usernameStatus, setUsernameStatus] = useState<{
        checking: boolean
        available?: boolean
        message?: string
    }>({ checking: false })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const passwordReqs = getPasswordRequirements(password)
    const passwordValid = passwordReqs.every((req) => req.passed)
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

    // Check username availability with debounce
    useEffect(() => {
        if (username.length < 3) {
            setUsernameStatus({ checking: false })
            return
        }

        setUsernameStatus({ checking: true })
        const timer = setTimeout(async () => {
            const result = await checkUsernameAvailability(username)
            setUsernameStatus({
                checking: false,
                available: result.available,
                message: result.message,
            })
        }, 500)

        return () => clearTimeout(timer)
    }, [username])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!passwordValid) {
            setError('Please ensure your password meets all requirements')
            return
        }

        if (!passwordsMatch) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('username', username)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('confirmPassword', confirmPassword)
            formData.append('name', name)

            const result = await registerUser(formData)

            if (result.success) {
                setSuccess(result.message || 'Account created successfully!')
                setTimeout(() => router.push('/login'), 3000)
            } else {
                setError(result.error || 'Registration failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-md w-full">
                <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 shadow-lg mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                                Create Account
                            </span>
                        </h2>
                        <p className="mt-3 text-gray-600 font-medium">
                            Request access to the teacher system
                        </p>
                    </div>

                    {success && (
                        <div className="mb-6 rounded-xl bg-green-50 border-2 border-green-200 p-4">
                            <p className="text-sm font-semibold text-green-800">{success}</p>
                            <p className="text-xs text-green-600 mt-1">Redirecting to login...</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
                            <p className="text-sm font-semibold text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                                Username *
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Choose a username"
                            />
                            {username.length >= 3 && (
                                <p className={`text-xs mt-1 font-medium ${usernameStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                                    {usernameStatus.checking ? 'Checking...' : usernameStatus.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                Full Name (Optional)
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Your full name"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Create a strong password"
                            />
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {passwordReqs.map((req, i) => (
                                        <div key={i} className="flex items-center text-xs">
                                            {req.passed ? (
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <span className={req.passed ? 'text-green-600' : 'text-gray-600'}>{req.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                                Confirm Password *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Confirm your password"
                            />
                            {confirmPassword.length > 0 && (
                                <p className={`text-xs mt-1 font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !passwordValid || !passwordsMatch || (usernameStatus.available === false)}
                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
