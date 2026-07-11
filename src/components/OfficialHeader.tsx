// components/OfficialHeader.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Clock, Globe, Mail, Phone, Zap } from 'lucide-react';
import { FaFacebook, FaYoutube } from 'react-icons/fa';

interface OfficialHeaderProps {
  showFull?: boolean;
}

export default function OfficialHeader({ showFull = true }: OfficialHeaderProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="bg-emerald-900 text-white">
      {/* Top Bar - Contact Info */}
      <div className="border-b border-emerald-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-1.5 text-xs">
            <div className="flex items-center space-x-4">
              <a href="tel:+8801712345678" className="flex items-center space-x-1 hover:text-emerald-300 transition-colors">
                <Phone size={14} />
                <span>+880 1712-345678</span>
              </a>
              <a href="mailto:info@wzpdc.gov.bd" className="flex items-center space-x-1 hover:text-emerald-300 transition-colors">
                <Mail size={14} />
                <span>info@wzpdc.gov.bd</span>
              </a>
              <span className="flex items-center space-x-1 text-emerald-300">
                <Clock size={14} />
                <span>24/7 Customer Support</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <a href="#" className="hover:text-emerald-300 transition-colors">
                <FaFacebook size={14} />
              </a>
              <a href="#" className="hover:text-emerald-300 transition-colors">
                <FaYoutube size={14} />
              </a>
              <a href="#" className="hover:text-emerald-300 transition-colors">
                <Globe size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Logo and Title */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo - Using your provided logo with fallback */}
            <div className="flex-shrink-0">
              {!imgError ? (
                <Image
                  src="https://i.ibb.co.com/VYBv8n64/Untitled-1.png"
                  alt="WZPDCL Logo"
                  width={60}
                  height={60}
                  className="h-16 w-auto object-contain"
                  onError={() => setImgError(true)}
                  priority
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Zap size={32} className="text-yellow-400" />
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight">
                West Zone Power Distribution Company Limited
              </h1>
              <div className="flex items-center space-x-2 text-sm text-emerald-300">
                <span>WZPDCL</span>
                <span className="w-px h-4 bg-emerald-700"></span>
                <span>Sales and Distribution Division-1</span>
                <span className="w-px h-4 bg-emerald-700"></span>
                <span className="text-emerald-400">Kushtia</span>
              </div>
            </div>
          </div>

          {/* Quick Stats or Badges */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-300">1,247</p>
              <p className="text-xs text-emerald-400">Active Connections</p>
            </div>
            <div className="w-px h-10 bg-emerald-700"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-300">98.5%</p>
              <p className="text-xs text-emerald-400">Reliability</p>
            </div>
            <div className="w-px h-10 bg-emerald-700"></div>
            <div className="flex items-center space-x-1 bg-emerald-800/50 px-3 py-1.5 rounded-full">
              <Award size={16} className="text-yellow-400" />
              <span className="text-xs font-medium">ISO 9001:2024</span>
            </div>
          </div>

          {/* Mobile Header Title */}
          <div className="sm:hidden text-right">
            <p className="text-sm font-bold">WZPDCL</p>
            <p className="text-xs text-emerald-300">Div-1, Kushtia</p>
          </div>
        </div>
      </div>
    </header>
  );
}