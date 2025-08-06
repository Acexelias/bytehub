import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Mail, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function UserManagement({ onUpdate }) {
  const [users, setUsers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await User.list();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setLoading(false);
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      // Note: This is a placeholder - actual user invitation would need to be implemented
      // through the proper invite system mentioned in the error
      console.log("Would invite user:", inviteEmail);
      alert(`User invitation system needs to be implemented. Please use the dashboard to invite ${inviteEmail}`);
      setInviteEmail("");
      onUpdate();
    } catch (error) {
      console.error("Error inviting user:", error);
    }
    setInviting(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-gray-800 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Invite Form */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite New Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteUser} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white flex-1"
              required
            />
            <Button
              type="submit"
              disabled={inviting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {inviting ? "Inviting..." : "Send Invite"}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Note: Use the main dashboard to properly invite users to the platform
          </p>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Role</TableHead>
                  <TableHead className="text-gray-400">Rep Code</TableHead>
                  <TableHead className="text-gray-400">Commission Rate</TableHead>
                  <TableHead className="text-gray-400">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-gray-800"
                  >
                    <TableCell className="text-white font-medium">
                      {user.full_name || 'Not set'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}>
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'Rep'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.rep_code || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.commission_rate ? `${(user.commission_rate * 100).toFixed(0)}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {user.leads_contacted || 0} leads • {user.bookings_made || 0} bookings
                        </span>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Team Members</h3>
              <p className="text-gray-400">Invite team members to start building your sales force.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}