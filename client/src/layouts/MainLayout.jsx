import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer, AIChatBot } from '../components/common';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-500">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* AI Fitness Chatbot - Available for logged-in members */}
      <AIChatBot />
    </div>
  );
};

export default MainLayout;
