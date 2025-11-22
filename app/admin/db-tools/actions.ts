'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function checkDatabaseStatus() {
    try {
        // Check if User table has 'name' column
        const result = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User';
        `
        return { success: true, columns: result }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function fixDatabaseSchema() {
    try {
        // 1. Create Enums if they don't exist
        try {
            await prisma.$executeRawUnsafe(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'REGULAR');`)
        } catch (e) {
            console.log('Role enum might already exist')
        }

        try {
            await prisma.$executeRawUnsafe(`CREATE TYPE "Status" AS ENUM ('ACTIVE', 'SUSPENDED');`)
        } catch (e) {
            console.log('Status enum might already exist')
        }

        // 2. Add columns safely
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" DEFAULT 'REGULAR';`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "Status" DEFAULT 'ACTIVE';`)

        // Handle timestamps
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`)

        return { success: true, message: 'Schema patched successfully' }
    } catch (e: any) {
        console.error('Fix failed:', e)
        return { success: false, error: e.message }
    }
}
