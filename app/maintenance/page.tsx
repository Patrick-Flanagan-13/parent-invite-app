export const dynamic = 'force-dynamic'

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Under Maintenance</h1>
                <p className="text-gray-600 mb-6">
                    We are currently performing scheduled maintenance to improve your experience.
                    Please check back in a few minutes.
                </p>
                <div className="animate-pulse flex justify-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mx-1"></div>
                    <div className="h-2 w-2 bg-blue-600 rounded-full mx-1 animation-delay-200"></div>
                    <div className="h-2 w-2 bg-blue-600 rounded-full mx-1 animation-delay-400"></div>
                </div>
            </div>
        </div>
    )
}
