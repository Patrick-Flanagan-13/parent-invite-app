import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
    let teachers = []
    let error = null

    try {
        teachers = await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                // Assuming we want to show all active users as teachers for now
                // If there's a specific role for teachers, we can add it here:
                // role: 'USER' 
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                username: true,
                _count: {
                    select: { slots: true }
                }
            }
        })
    } catch (e: any) {
        console.error('Failed to fetch teachers:', e)
        error = e.message || 'Failed to load teachers'
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">System Unavailable</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Modern Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-900 text-xl tracking-tight">Quail Run Elementary</span>
                    </div>
                    <a href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Teacher Login
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative bg-slate-900 h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/san-ramon-hills.jpg"
                        alt="San Ramon Hills"
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-3xl">
                        Class Sign-Ups
                    </h1>
                    <p className="text-xl text-slate-200 max-w-2xl font-light">
                        We appreciate your support and engagement in your child's education! Select a teacher below to view available conference times.
                    </p>
                </div>
            </div>

            {/* Teachers Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Teachers</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map((teacher) => (
                        <a
                            key={teacher.id}
                            href={`/teachers/${teacher.username}`}
                            className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex items-center gap-4"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold group-hover:scale-110 transition-transform">
                                {(teacher.name || teacher.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {teacher.name || teacher.username}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {teacher._count.slots} {teacher._count.slots === 1 ? 'slot' : 'slots'} available
                                </p>
                            </div>
                            <div className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </a>
                    ))}

                    {teachers.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white border border-gray-200 border-dashed rounded-2xl">
                            <p className="text-slate-500">No active teachers found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
