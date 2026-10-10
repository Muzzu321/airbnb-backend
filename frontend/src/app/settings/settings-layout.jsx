import React from 'react'
import { Outlet } from 'react-router'
import SettingsSidebar from './settings-sidebar'
import TravelerContextProvider from '@/lib/providers/travelers-context';

const SettingsLayout = () => {
  return (
    <div className="container flex gap-6 mt-6 mb-12">
      <SettingsSidebar />
      <div className="flex-1">
        <TravelerContextProvider>
          <Outlet />
        </TravelerContextProvider>
      </div>
    </div>
  );
}

export default SettingsLayout