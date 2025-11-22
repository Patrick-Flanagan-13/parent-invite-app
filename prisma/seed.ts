import { PrismaClient, Role, Status } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password', 10)

    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            passwordHash,
            role: Role.ADMIN,
            status: Status.ACTIVE,
        },
        create: {
            username: 'admin',
            passwordHash,
            role: Role.ADMIN,
            status: Status.ACTIVE,
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
