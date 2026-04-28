import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden text-gray-800" style={{ backgroundColor: '#fbfbf0' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8" style={{ backgroundColor: '#fbfbf0' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;