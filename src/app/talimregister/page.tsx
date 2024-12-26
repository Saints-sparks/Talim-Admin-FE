'use client';

import RegistrationForm from '@/components/Registrationform/Form';
import Sidebar from '@/components/TalimSidebar/Sidebar';
import React from 'react';


export default function Register() {
  return (
    <div className=" flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
 

      {/* Main Content */}
      <main className="w-[100%] bg-slate-300">
        <RegistrationForm/>
      
      </main>
    </div>
  );
}
