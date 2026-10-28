import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DisclaimerBanner } from './DisclaimerBanner';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top SIH 2026 Prototype Disclaimer */}
      <DisclaimerBanner />

      <div className="flex-1 flex">
        {/* Left Nav Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
        >
          <Topbar onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Clean Government Footer */}
          <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">VERINEX AI</span>
              <span>— AICTE Case Coordination Intelligence System</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Smart India Hackathon (SIH) 2026</span>
              <span>•</span>
              <span>Team 197631</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">Explainable Human-in-the-Loop AI</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
