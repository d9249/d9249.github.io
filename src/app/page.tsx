'use client';

import React from 'react';
import Terminal from '@/components/Terminal';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black w-full">
      <div className="flex-grow flex items-start justify-center p-4 w-full h-screen">
        <div className="w-full max-w-5xl h-full flex flex-col">
          <Terminal />
        </div>
      </div>
    </div>
  );
}