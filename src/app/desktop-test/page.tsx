"use client";

import { DesktopOnlyWrapper } from "@/components/ui/desktop-only-wrapper";

export default function DesktopTestPage() {
  return (
    <DesktopOnlyWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Desktop-Only Test Page
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-700 mb-4">
              This page demonstrates the DesktopOnlyWrapper component in action.
            </p>
            <p className="text-gray-600">
              On desktop/laptop: You see this content normally.
            </p>
            <p className="text-gray-600">
              On mobile: Users see a minimalist message directing them to use a desktop/laptop.
            </p>
          </div>
        </div>
      </div>
    </DesktopOnlyWrapper>
  );
}