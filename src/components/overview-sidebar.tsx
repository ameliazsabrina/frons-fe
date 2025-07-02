import React from "react";

export function OverviewSidebar({ connected }: { connected: boolean }) {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4 hidden md:block">
      <div className="font-bold text-lg mb-4">Fronsciers</div>
      <div className="text-sm text-gray-600 mb-2">
        {connected ? "Connected" : "Not Connected"}
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <a href="/doci-tracker" className="text-primary hover:underline">
              DOCI Tracker
            </a>
          </li>
          <li>
            <a href="/review-manuscript" className="hover:underline">
              Review Manuscript
            </a>
          </li>
          <li>
            <a href="/submit-manuscript" className="hover:underline">
              Submit Manuscript
            </a>
          </li>
          <li>
            <a href="/your-profile" className="hover:underline">
              Your Profile
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
