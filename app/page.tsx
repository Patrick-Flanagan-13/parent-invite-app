import { prisma } from '@/lib/db'
import { signupForSlot } from './actions'

export default async function Home() {
  const slots = await prisma.slot.findMany({
    orderBy: { startTime: 'asc' },
    include: { _count: { select: { signups: true } } },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-amber-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-600">
                Parent-Teacher
              </span>
              <span className="block text-gray-900 mt-2">Conference Signups</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 font-light">
              Connect with your child's teacher and be part of their educational journey in San Ramon.
            </p>
          </div>
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Available Time Slots</h2>
          <p className="text-lg text-gray-600">Select a convenient time to meet with the teacher</p>
        </div>

        <div className="space-y-4">
          {slots.map((slot) => {
            const isFull = slot._count.signups >= slot.maxCapacity
            return (
              <div
                key={slot.id}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${isFull ? 'opacity-60' : ''
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-amber-500/5 rounded-2xl"></div>
                <div className="relative px-6 py-6 sm:px-8 sm:py-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {new Date(slot.startTime).getDate()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {new Date(slot.startTime).toLocaleString(undefined, {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                          <p className="text-base text-gray-600 font-medium">
                            {new Date(slot.startTime).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(slot.endTime).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-medium mt-2 ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                        {isFull
                          ? '✗ This slot is full'
                          : `✓ ${slot.maxCapacity - slot._count.signups} ${slot.maxCapacity - slot._count.signups === 1 ? 'spot' : 'spots'} available`}
                      </p>
                    </div>

                    {!isFull && (
                      <div className="sm:ml-4 flex-shrink-0">
                        <details className="group/details">
                          <summary className="cursor-pointer list-none">
                            <div className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                              Sign Up Now
                              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </summary>
                          <div className="absolute right-0 mt-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl z-20 p-6 border-2 border-gray-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Complete Your Registration</h4>
                            <form action={signupForSlot} className="space-y-4">
                              <input type="hidden" name="slotId" value={slot.id} />
                              <div>
                                <label htmlFor={`name-${slot.id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                                  Your Name
                                </label>
                                <input
                                  type="text"
                                  name="parentName"
                                  id={`name-${slot.id}`}
                                  required
                                  className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all"
                                  placeholder="Enter your full name"
                                />
                              </div>
                              <div>
                                <label htmlFor={`email-${slot.id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  id={`email-${slot.id}`}
                                  required
                                  className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all"
                                  placeholder="your.email@example.com"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
                              >
                                Confirm Registration
                              </button>
                            </form>
                          </div>
                        </details>
                      </div>
                    )}
                    {isFull && (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 border-2 border-gray-200">
                        Fully Booked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {slots.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-amber-100 mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Slots Available</h3>
              <p className="text-lg text-gray-600">Check back soon for new conference times!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} San Ramon Parent-Teacher Conferences. Building stronger connections for student success.
          </p>
        </div>
      </div>
    </div>
  )
}
