import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Lead } from "@/api/entities";
import { LeadRequest } from "@/api/entities";
import { Sale } from "@/api/entities";
import { Announcement } from "@/api/entities";
import { SupportTicket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Settings, 
  MessageSquare, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Palette // Added Palette icon
} from "lucide-react";
import { motion } from "framer-motion";

import UserManagement from "../components/admin/UserManagement";
import LeadAssignment from "../components/admin/LeadAssignment";
import CommissionManagement from "../components/admin/CommissionManagement";
import AnnouncementManager from "../components/admin/AnnouncementManager";
import SupportManager from "../components/admin/SupportManager";
import AdminStats from "../components/admin/AdminStats";
import ConfigurationManager from "../components/admin/ConfigurationManager"; // Added ConfigurationManager import

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    pendingRequests: 0,
    openTickets: 0,
    totalSales: 0,
    unpaidCommissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const currentUser = await User.me();
      
      if (currentUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      
      setUser(currentUser);

      // Load stats
      const [users, leads, requests, tickets, sales] = await Promise.all([
        User.list(),
        Lead.list(),
        LeadRequest.filter({ status: 'pending' }),
        SupportTicket.filter({ status: 'open' }),
        Sale.list()
      ]);

      const unpaidCommissions = sales
        .filter(sale => !sale.commission_paid)
        .reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);

      setStats({
        totalUsers: users.length,
        totalLeads: leads.length,
        pendingRequests: requests.length,
        openTickets: tickets.length,
        totalSales: sales.length,
        unpaidCommissions
      });

    } catch (error) {
      console.error("Error loading admin data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 max-w-md mx-auto mt-20">
        <Card className="bg-gray-900 border-red-500/50">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminCards = [
    {
      title: "Total Team Members",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      badge: stats.totalUsers > 0 ? `${stats.totalUsers - 1} reps` : "No reps yet"
    },
    {
      title: "Active Leads",
      value: stats.totalLeads,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      badge: stats.pendingRequests > 0 ? `${stats.pendingRequests} pending requests` : "No pending requests"
    },
    {
      title: "Open Support Tickets",
      value: stats.openTickets,
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      badge: stats.openTickets > 0 ? "Needs attention" : "All resolved"
    },
    {
      title: "Unpaid Commissions",
      value: `£${stats.unpaidCommissions.toFixed(2)}`,
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500",
      badge: stats.unpaidCommissions > 0 ? "Payment due" : "All paid"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage your team, leads, and business operations</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30">
          <Shield className="w-4 h-4 mr-1" />
          Administrator Access
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-200`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.badge.includes('pending') || stat.badge.includes('attention') || stat.badge.includes('due') ? (
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{stat.badge}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-800 flex-wrap h-auto p-2">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="configuration" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Palette className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Users className="w-4 h-4 mr-2" />
            Team Management
          </TabsTrigger>
          <TabsTrigger 
            value="leads" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Lead Assignment
          </TabsTrigger>
          <TabsTrigger 
            value="commissions" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Commissions
          </TabsTrigger>
          <TabsTrigger 
            value="announcements" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger 
            value="support" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Support Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStats onRefresh={loadAdminData} />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <ConfigurationManager onUpdate={loadAdminData} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement onUpdate={loadAdminData} />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <LeadAssignment onUpdate={loadAdminData} />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <CommissionManagement onUpdate={loadAdminData} />
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          <AnnouncementManager onUpdate={loadAdminData} />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportManager onUpdate={loadAdminData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}