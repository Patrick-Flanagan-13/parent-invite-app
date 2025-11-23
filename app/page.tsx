import { prisma } from '@/lib/db'
import { signupForSlot } from './actions'
import SignupForm from './SignupForm'
import { Slot } from '@prisma/client'

export const dynamic = 'force-dynamic'

type SlotWithCount = Slot & { _count: { signups: number } }

export default async function Home() {
  let slots: SlotWithCount[] = []
  let error = null

  try {
    slots = await prisma.slot.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        _count: { select: { signups: true } },
        createdBy: { select: { name: true, username: true } }
      },
    })
  } catch (e: any) {
    console.error('Failed to fetch slots:', e)
    error = e.message || 'Failed to load slots'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://qres.srvusd.net/pictures/Quail-Run-Elementary-School-e1575930457325.jpg"
            alt="Quail Run Elementary School - San Ramon, California"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-amber-900/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold">
              <span className="block text-white drop-shadow-2xl">
                Parent-Teacher
              </span>
              <span className="block text-amber-300 mt-2 drop-shadow-2xl">Conference Signups</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-white/95 font-light drop-shadow-lg">
              Connect with your child's teacher and be part of their educational journey in San Ramon.
            </p>
            <div className="mt-8">
              <a
                href="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 rounded-xl text-lg font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Teacher Login
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Available Time Slots</h2>
            <p className="text-lg text-gray-600">Select a convenient time to meet with the teacher</p>
          </div>
        </div>

        <div className="space-y-4">
          {slots.map((slot) => {
            const isFull = slot._count.signups >= slot.maxCapacity
            // @ts-ignore - createdBy is not in the type definition yet but it is in the query
            const teacherName = slot.createdBy?.name || slot.createdBy?.username || 'Unknown Teacher'

            return (
              <details key={slot.id} className="group">
                <summary className="list-none">
                  <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${isFull ? 'opacity-60' : ''}`}>
                    <div className="px-6 py-6 sm:px-8 sm:py-7">
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
                              <p className="text-sm text-indigo-600 font-semibold mt-1">
                                Teacher: {teacherName}
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
                            <div className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                              Sign Up Now
                              <svg className="ml-2 w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
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
                </summary>

                {/* Full-Width Signup Form Below */}
                {!isFull && (
                  <SignupForm slotId={slot.id} />
                )}
              </details>
            )
          })}
          {slots.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
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
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} San Ramon Parent-Teacher Conferences. Building stronger connections for student success.
          </p>
        </div>
      </div>
    </div>
  )
}
