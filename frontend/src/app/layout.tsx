"use client";

import { Inter } from 'next/font/google';
import Sidebar from "@/components/Sidebar";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} flex h-screen overflow-hidden bg-gray-50`}>
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </body>
        </html>
    );
}
