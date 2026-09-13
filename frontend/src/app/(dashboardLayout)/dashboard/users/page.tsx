"use client";

import { useState } from "react";
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
} from "@/redux/api/authApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Mail,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetAllUsersQuery({
    search: searchTerm || undefined,
  });

  const [updateUserStatus, { isLoading: isUpdating }] =
    useUpdateUserStatusMutation();

  const users = data?.data || [];

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const toastId = toast.loading(`Updating ${user.name || user.email}...`);

    try {
      await updateUserStatus({
        id: user.id,
        status: newStatus,
      }).unwrap();
      toast.success(`User is now ${newStatus}`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user status", {
        id: toastId,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            User Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered members, review roles, and control access
            permissions.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email..."
            className="pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              <div className="inline-block h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400 space-y-3">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((item: any) => {
                    const isBlocked = item.status === "BLOCKED";
                    const isAdmin = item.role === "ADMIN";
                    const joined = new Date(item.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {item.name ? item.name[0] : item.email[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {item.name || item.fullName || "User"}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {item.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={isAdmin ? "default" : "secondary"}
                            className={`text-[10px] font-bold ${
                              isAdmin
                                ? "bg-black text-amber-400"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isAdmin ? "👑 ADMIN" : "USER"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.isEmailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                              <Mail className="h-3.5 w-3.5" /> Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={isBlocked ? "destructive" : "success"}
                            className="text-[10px] font-bold uppercase"
                          >
                            {item.status || "ACTIVE"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                          {joined}
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <Button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isUpdating || isAdmin}
                            size="sm"
                            variant="outline"
                            className={`h-8 px-3 rounded-lg text-xs font-semibold ${
                              isBlocked
                                ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                : "text-red-600 border-red-200 hover:bg-red-50"
                            } ${isAdmin ? "opacity-30 cursor-not-allowed" : ""}`}
                          >
                            {isBlocked ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1" />{" "}
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5 mr-1" /> Block
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
