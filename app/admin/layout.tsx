import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SidebarLayout from './layouts/SidebarLayout'

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
        <SidebarLayout user={session.user}>
            {children}
        </SidebarLayout>
    )
}
