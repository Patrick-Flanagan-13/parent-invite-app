import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { cancelSignup } from './actions'

export default async function CancelPage({ params }: { params: { token: string } }) {
    try {
        console.log('Cancellation page - Looking for token:', params.token)

        const signup = await prisma.signup.findUnique({
            where: { cancellationToken: params.token },
            include: {
                slot: {
                    include: {
                        createdBy: { select: { name: true, username: true } }
                    }
                },
            },
        })

        if (!signup) {
            console.log('Signup not found for token:', params.token)
            notFound()
        }

        console.log('Signup found:', signup.id)

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Cancel Conference</h1>
                        <p className="mt-2 text-gray-600">
                            Are you sure you want to cancel this parent-teacher conference?
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conference Details</h2>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Parent Name</p>
                                <p className="text-base text-gray-900">{signup.parentName}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-base text-gray-900">{signup.email}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Teacher</p>
                                <p className="text-base text-gray-900">{teacherName}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                <p className="text-base text-gray-900">
                                    {new Date(signup.slot.startTime).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="text-base text-gray-900">
                                    {new Date(signup.slot.startTime).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })} - {new Date(signup.slot.endTime).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <p className="text-sm text-yellow-800">
                            ⚠️ This action cannot be undone. Your time slot will become available for others to book.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <form action={cancelSignup.bind(null, params.token)} className="flex-1">
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                Yes, Cancel My Conference
                            </button>
                        </form>

                        <a
                            href="/"
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
                        >
                            Keep My Conference
                        </a>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Error loading cancellation page:', error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Page</h1>
                    <p className="text-gray-600 mb-4">
                        There was an error loading the cancellation page. The link may be invalid or expired.
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Return to Home
                    </a>
                </div>
            </div>
        )
    }
}
