"use client";

import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30">
            {/* Left: Logo */}
            <div className="flex items-center">
                <Link href="/">
                    <img
                        src="/cglx-full-logo.svg"
                        alt="Cognologix Logo"
                        className="h-10 w-auto cursor-pointer"
                    />
                </Link>
            </div>

            {/* Right: Actions and Profile */}
            <div className="flex items-center gap-8">
                <Link href="/reports">
                    <span className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors cursor-pointer">
                        Reports
                    </span>
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 leading-none">Nagesh Nale</p>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tighter">IT Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50">
                        <img
                            src="https://ui-avatars.com/api/?name=Nagesh+Nale&background=F26522&color=fff"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
