'use client'

import { useState } from 'react'
import Link from 'next/link'

type Teacher = {
    id: string
    name: string | null
    username: string
    _count: {
        slots: number
    }
}

export default function TeacherGrid({ teachers }: { teachers: Teacher[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTeachers = teachers.filter(teacher => {
        const name = teacher.name || teacher.username
        return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Teachers & Parents</h2>
                <div className="relative max-w-md w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search teachers..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher) => (
                    <Link
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
                        </div>
                        <div className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}

                {filteredTeachers.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white border border-gray-200 border-dashed rounded-2xl">
                        <p className="text-slate-500">No teachers found matching "{searchQuery}".</p>
                    </div>
                )}
            </div>
        </div>
    )
}
