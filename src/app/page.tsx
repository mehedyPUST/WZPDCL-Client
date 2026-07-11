// app/page.tsx
import OfficialHeader from '@/components/OfficialHeader';
import Navbar from '@/components/Navbar';
import { Bolt, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Official Header */}
      <OfficialHeader />

      {/* Main Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex items-center justify-center h-[70vh]">
        <div className="text-center p-8 max-w-2xl">
          <div className="flex justify-center mb-4">
            <Bolt size={64} className="text-emerald-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-emerald-800 md:text-5xl">
            WZPDCL
          </h1>
          <p className="text-xl text-gray-700 mt-4 font-medium">
            West Zone Power Distribution Company Limited
          </p>
          <p className="text-md text-gray-500 mt-2">
            Sales and Distribution Division-1, Kushtia
          </p>
          <div className="mt-6 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-lg inline-flex items-center space-x-2 shadow-sm">
            <Sparkles size={20} />
            <span>Powering the Future</span>
          </div>
        </div>
      </main>
    </div>
  );
}