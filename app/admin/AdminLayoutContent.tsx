'use client'

import { useState, useEffect } from 'react'
import TopNavLayout from './layouts/TopNavLayout'
import SidebarLayout from './layouts/SidebarLayout'

export default function AdminLayoutContent({
    children,
    user
}: {
    children: React.ReactNode
    user: any
}) {
    const [layoutMode, setLayoutMode] = useState<'top' | 'sidebar'>('top') // Default to 'top' initially

    // Load preference from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('adminLayoutMode') as 'top' | 'sidebar'
        if (savedMode) {
            setLayoutMode(savedMode)
        }
    }, [])

    const toggleLayout = () => {
        const newMode = layoutMode === 'top' ? 'sidebar' : 'top'
        setLayoutMode(newMode)
        localStorage.setItem('adminLayoutMode', newMode)
    }

    const LayoutComponent = layoutMode === 'sidebar' ? SidebarLayout : TopNavLayout

    return (
        <div className="relative min-h-screen">
            <LayoutComponent user={user}>
                {children}
            </LayoutComponent>

            {/* Global Layout Toggle Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleLayout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all border border-slate-700 text-sm font-medium opacity-50 hover:opacity-100"
                    title="Switch Layout"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {layoutMode === 'top' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                    {layoutMode === 'top' ? 'Try Sidebar' : 'Use Top Nav'}
                </button>
            </div>
        </div>
    )
}
