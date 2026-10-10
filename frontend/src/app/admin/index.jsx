import Header from '@/components/layouts/header.layout';
import React from 'react';
import { Outlet } from 'react-router';

const Admin = () => {
  return (
    <div>
      <Header showServiceList={false} />
      <main className='py-4'>
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
