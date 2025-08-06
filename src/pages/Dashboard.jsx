import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Sale } from "@/api/entities";
import { Announcement } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  PoundSterling, 
  TrendingUp, 
  Phone,
  MessageSquare,
  Award,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    leadsContacted: 0,
    bookingsMade: 0,
    commissionEarned: 0,
    commissionPending: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load user leads and sales
      const userLeads = await Lead.filter({ assigned_to: currentUser.email });
      const userSales = await Sale.filter({ rep_email: currentUser.email });
      
      // Load active announcements
      const activeAnnouncements = await Announcement.filter({ is_active: true }, '-created_date');
      setAnnouncements(activeAnnouncements);

      // Calculate stats
      const contactedLeads = userLeads.filter(lead => 
        ['contacted', 'replied', 'booked', 'closed'].includes(lead.status)
      ).length;
      
      const bookedLeads = userLeads.filter(lead => lead.status === 'booked').length;
      
      const totalCommission = userSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
      const pendingCommission = userSales
        .filter(sale => !sale.commission_paid)
        .reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);

      setStats({
        leadsContacted: contactedLeads,
        bookingsMade: bookedLeads,
        commissionEarned: totalCommission,
        commissionPending: pendingCommission
      });

      // Recent activity (mix of leads and sales)
      const recentLeads = userLeads
        .filter(lead => lead.last_contacted)
        .sort((a, b) => new Date(b.last_contacted) - new Date(a.last_contacted))
        .slice(0, 3)
        .map(lead => ({
          type: 'lead',
          title: `Contacted ${lead.company_name}`,
          subtitle: `Status: ${lead.status}`,
          date: lead.last_contacted,
          status: lead.status
        }));

      const recentSales = userSales
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 3)
        .map(sale => ({
          type: 'sale',
          title: `Sale: ${sale.client_name}`,
          subtitle: `£${sale.sale_amount}`,
          date: sale.created_date,
          status: sale.payment_status
        }));

      setRecentActivity([...recentLeads, ...recentSales]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
      );

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  const statCards = [
    {
      title: "Leads Contacted",
      value: stats.leadsContacted,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      change: "+12% this week"
    },
    {
      title: "Bookings Made",
      value: stats.bookingsMade,
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      change: "+8% this week"
    },
    {
      title: "Commission Earned",
      value: `£${stats.commissionEarned.toFixed(2)}`,
      icon: PoundSterling,
      color: "from-purple-500 to-pink-500",
      change: `£${stats.commissionPending.toFixed(2)} pending`
    },
    {
      title: "Performance Score",
      value: Math.min(100, Math.round((stats.leadsContacted * 2 + stats.bookingsMade * 10))),
      icon: Award,
      color: "from-orange-500 to-red-500",
      suffix: "%"
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Team Member'}! 👋
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your leads and commissions today.
        </p>
      </motion.div>

      {/* Active Announcements */}
      {announcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {announcements.map((announcement, index) => (
            <Card key={announcement.id} className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 mb-4">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">{announcement.title}</h3>
                      <p className="text-gray-300 mt-1">{announcement.message}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`
                    ${announcement.type === 'urgent' ? 'bg-red-500/20 text-red-400' : 
                      announcement.type === 'success' ? 'bg-green-500/20 text-green-400' :
                      announcement.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'}
                  `}>
                    {announcement.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-200`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'sale' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {activity.type === 'sale' ? <PoundSterling className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{activity.title}</p>
                        <p className="text-sm text-gray-400">{activity.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{format(new Date(activity.date), 'MMM d')}</p>
                        <Badge variant="secondary" className={`text-xs ${
                          activity.status === 'booked' || activity.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          activity.status === 'contacted' || activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No recent activity yet</p>
                  <Link to={createPageUrl("Leads")}>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      View Your Leads
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl("Leads")} className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Leads
                </Button>
              </Link>
              <Link to={createPageUrl("Resources")} className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Scripts
                </Button>
              </Link>
              <Link to={createPageUrl("Support")} className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <Phone className="w-4 h-4 mr-2" />
                  Get Support
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-semibold text-white mb-2">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">Contact Elias directly</p>
                <a 
                  href="tel:07359735508" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>07359 735508</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}