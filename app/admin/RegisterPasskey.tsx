'use client'

import { startRegistration } from '@simplewebauthn/browser'
import { generateRegistrationOptionsAction, verifyRegistrationAction } from '@/app/actions/passkeys'
import { useState } from 'react'

export default function RegisterPasskey() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    async function handleRegister() {
        setLoading(true)
        setMessage('')
        try {
            // 1. Get options from server
            const options = await generateRegistrationOptionsAction()

            if ((options as any).error) {
                throw new Error((options as any).error)
            }

            // 2. Pass options to browser API
            const attResp = await startRegistration({ optionsJSON: options as any })

            // 3. Send response to server for verification
            const verification = await verifyRegistrationAction(attResp)

            if (verification.success) {
                setMessage('✅ Passkey registered successfully!')
            } else {
                setMessage('❌ Registration failed.')
            }
        } catch (error: any) {
            console.error(error)
            if (error.name === 'InvalidStateError') {
                setMessage('Error: This device is already registered.')
            } else {
                setMessage(`Error: ${error.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <button
                onClick={handleRegister}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register New Passkey'}
            </button>
            {message && <p className="mt-2 text-sm font-medium text-gray-700">{message}</p>}
        </div>
    )
}
