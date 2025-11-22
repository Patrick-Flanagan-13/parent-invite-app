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

    const patrickPasswordHash = await bcrypt.hash('QuailRun1', 10)
    const patrick = await prisma.user.upsert({
        where: { username: 'patrick' },
        update: {
            passwordHash: patrickPasswordHash,
            role: Role.ADMIN,
            status: Status.ACTIVE,
        },
        create: {
            username: 'patrick',
            passwordHash: patrickPasswordHash,
            role: Role.ADMIN,
            status: Status.ACTIVE,
        },
    })

    console.log({ user, patrick })
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
