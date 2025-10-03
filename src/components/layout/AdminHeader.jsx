import React from 'react'
import ThemeToggle from './ThemeToggle'
import Sidebar from './Sidebar'

function AdminHeader({ onCollapse }) {
  return (
    <div className="ml-72 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Header content */}
      <div className="flex justify-end items-center">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold text-[#34699a] dark:text-white text-center sm:text-right">
            <span className="hidden sm:inline">DEMIREN HOTEL AND RESTAURANT</span>
            <span className="sm:hidden">DEMIREN HOTEL</span>
          </h1>
          <ThemeToggle />
        </div>
      </div>
      
      {/* Mobile sidebar trigger - only visible on mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sidebar />
      </div>
    </div>
  )
}

export default AdminHeader