import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking for advisory locks...')

    // Cast pid to int explicitly for pg_terminate_backend
    const locks = await prisma.$queryRaw`
    SELECT l.pid, locktype, mode, granted, client_addr, state, query_start
    FROM pg_locks l
    JOIN pg_stat_activity a ON l.pid = a.pid
    WHERE locktype = 'advisory'
  `

    console.log('Current advisory locks:', locks)

    if (Array.isArray(locks) && locks.length > 0) {
        console.log(`Found ${locks.length} locks. Attempting to terminate sessions...`)

        for (const lock of locks) {
            const pid = lock.pid
            console.log(`Terminating session ${pid}...`)
            try {
                // Explicitly cast pid to integer for PostgreSQL
                await prisma.$executeRaw`SELECT pg_terminate_backend(${pid}::int)`
                console.log(`Terminated session ${pid}`)
            } catch (e) {
                console.error(`Failed to terminate session ${pid}:`, e)
            }
        }
    } else {
        console.log('No advisory locks found.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
