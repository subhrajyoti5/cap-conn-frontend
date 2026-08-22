"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { listPendingUsers, approveUser, rejectUser } from "@/features/users/api/users.api";

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);

  async function load() {
    const token = await getToken();
    const res = await listPendingUsers(token);
    setUsers(res.data || []);
  }

  useEffect(() => {
    load();
  }, [getToken]);

  async function handleApprove(id) {
    const token = await getToken();
    await approveUser(token, id);
    load();
  }

  async function handleReject(id) {
    const token = await getToken();
    await rejectUser(token, id, "");
    load();
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pending Approvals</h1>
      {users.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <li key={u.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{u.email}</p>
                <p className="text-sm text-gray-600">Role: {u.role}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(u.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
