import React from 'react'
import { SidebarProvider } from '../ui/sidebar'
import AdminSidebar from './admin-sidebar.layout'
import { AdminHeader } from './admin-header.layout'
import { Outlet } from 'react-router'
import { AdminContextProvider } from '@/lib/providers/admin-context-provider'

const AdminLayout = () => {
  return (
    <AdminContextProvider>
      <div className="flex items-center justify-start min-h-screen">
        <SidebarProvider
          style={{
            '--sidebar-width': '16rem',
            '--sidebar-width-mobile': '16rem',
            '--sidebar-width-icon': '53px',
          }}
        >
          <AdminSidebar />
          <div className="w-full min-h-screen">
            <AdminHeader />
            <Outlet />
          </div>
        </SidebarProvider>
      </div>
    </AdminContextProvider>
  );
}

export default AdminLayout