"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
    department: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8080/api/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <Link
                    href="/users/new"
                    className="bg-primary hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-sm transition-colors"
                >
                    + Add User
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Department</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-xs">
                                        <span className={`px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'RESTRICTED_ADMIN' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.department}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <button className="text-primary hover:underline font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
