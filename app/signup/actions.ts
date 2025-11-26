'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/password'
import { verifyBot } from '@/lib/recaptcha'
import { Status, Role } from '@prisma/client'
import { headers } from 'next/headers'

export async function checkUsernameAvailability(username: string) {
    try {
        const normalizedUsername = username.toLowerCase().trim()

        if (normalizedUsername.length < 3) {
            return { available: false, message: 'Username must be at least 3 characters' }
        }

        const existing = await prisma.user.findUnique({
            where: { username: normalizedUsername },
        })

        if (existing) {
            return { available: false, message: 'Username is already taken' }
        }

        return { available: true, message: 'Username is available' }
    } catch (error) {
        console.error('Username check failed:', error)
        return { available: false, message: 'Error checking username' }
    }
}

export async function registerUser(formData: FormData) {
    try {
        const rawUsername = formData.get('username') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string
        const name = formData.get('name') as string

        // Validate inputs
        if (!rawUsername || !email || !password || !confirmPassword) {
            return { success: false, error: 'All fields are required' }
        }

        const username = rawUsername.toLowerCase().trim()

        // Check password match
        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' }
        }

        // Validate password strength
        if (!validatePasswordStrength(password)) {
            return { success: false, error: 'Password does not meet strength requirements' }
        }

        // Verify bot protection
        const requestHeaders = await headers()
        const isBotVerified = await verifyBot(requestHeaders)
        if (!isBotVerified) {
            return { success: false, error: 'Bot verification failed. Please try again.' }
        }

        // Check username or email availability
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            },
        })

        if (existing) {
            if (existing.username === username) {
                return { success: false, error: 'Username is already taken' }
            }
            if (existing.email === email) {
                return { success: false, error: 'Email is already registered' }
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Check if email is whitelisted
        const whitelisted = await (prisma as any).whitelistedEmail.findUnique({
            where: { email },
        })

        const status = whitelisted ? Status.ACTIVE : Status.SUSPENDED

        // Create user
        await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                name: name || null,
                role: Role.USER,
                status,
            },
        })

        return {
            success: true,
            message: 'Account created successfully! An administrator will review your request.',
        }
    } catch (error) {
        console.error('Registration failed:', error)
        return { success: false, error: 'An error occurred during registration. Please try again.' }
    }
}
