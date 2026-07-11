// components/OfficialHeaderSimple.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function OfficialHeaderSimple() {
    return (
        <div className="bg-emerald-900 text-white px-4 py-2">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                    <Image
                        src="https://i.ibb.co.com/VYBv8n64/Untitled-1.png"
                        alt="WZPDCL Logo"
                        width={40}
                        height={40}
                        className="h-10 w-auto"
                    />
                    <div>
                        <p className="text-sm font-bold">WZPDCL</p>
                        <p className="text-xs text-emerald-300">Sales & Distribution Div-1, Kushtia</p>
                    </div>
                </Link>
                <div className="text-right text-xs">
                    <p className="text-emerald-300">24/7 Helpline</p>
                    <p className="font-semibold">+880 1712-345678</p>
                </div>
            </div>
        </div>
    );
}