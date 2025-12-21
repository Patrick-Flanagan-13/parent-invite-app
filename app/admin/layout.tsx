import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayoutContent from './AdminLayoutContent'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <AdminLayoutContent user={session.user}>
            {children}
        </AdminLayoutContent>
    )
}
