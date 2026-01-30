"use client";

import { Inter } from 'next/font/google';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { usePathname } from 'next/navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 text-gray-900`}>
                {!isLoginPage ? (
                    <div className="flex flex-col h-screen overflow-hidden">
                        <Navbar />
                        <div className="flex flex-1 overflow-hidden">
                            <Sidebar />
                            <main className="flex-1 overflow-y-auto p-8">{children}</main>
                        </div>
                    </div>
                ) : (
                    <main className="h-screen w-full overflow-hidden">{children}</main>
                )}
            </body>
        </html>
    );
}
