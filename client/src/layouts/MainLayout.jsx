import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../components/common';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-500">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
