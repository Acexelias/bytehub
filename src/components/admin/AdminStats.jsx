import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Sale } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Users, PoundSterling } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, isAfter } from "date-fns";

export default function AdminStats({ onRefresh }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [users, leads, sales] = await Promise.all([
        User.list(),
        Lead.list(),
        Sale.list()
      ]);

      // Calculate time-based stats
      const last7Days = subDays(new Date(), 7);
      const last30Days = subDays(new Date(), 30);
      
      const recentSales = sales.filter(sale => 
        isAfter(new Date(sale.created_date), last7Days)
      );
      const recentLeads = leads.filter(lead => 
        isAfter(new Date(lead.created_date), last7Days)
      );

      // Top performers
      const repPerformance = users
        .filter(u => u.role === 'user')
        .map(rep => {
          const repSales = sales.filter(s => s.rep_email === rep.email);
          const repLeads = leads.filter(l => l.assigned_to === rep.email);
          const totalCommission = repSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);
          return {
            name: rep.full_name,
            email: rep.email,
            sales: repSales.length,
            leads: repLeads.length,
            commission: totalCommission
          };
        })
        .sort((a, b) => b.commission - a.commission);

      setStats({
        totalRevenue: sales.reduce((sum, s) => sum + (s.sale_amount || 0), 0),
        recentSales: recentSales.length,
        recentLeads: recentLeads.length,
        conversionRate: leads.length > 0 ? (sales.length / leads.length * 100).toFixed(1) : 0,
        topPerformers: repPerformance.slice(0, 3),
        totalCommissionOwed: sales
          .filter(s => !s.commission_paid)
          .reduce((sum, s) => sum + (s.commission_amount || 0), 0)
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    await loadStats();
    onRefresh();
  };

  if (loading || !stats) {
    return (
      <div className="grid gap-6">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Business Overview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Business Overview</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="border-gray-700 hover:border-purple-500"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <PoundSterling className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">£{stats.totalRevenue.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
              <p className="text-gray-400 text-sm">Lead Conversion</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.recentSales}</p>
              <p className="text-gray-400 text-sm">Sales (Last 7 Days)</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.recentLeads}</p>
              <p className="text-gray-400 text-sm">New Leads (Last 7 Days)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Reps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topPerformers.map((performer, index) => (
              <motion.div
                key={performer.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-500/20 text-gray-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{performer.name}</p>
                    <p className="text-sm text-gray-400">{performer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">£{performer.commission.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{performer.sales} sales • {performer.leads} leads</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commission Alert */}
      {stats.totalCommissionOwed > 0 && (
        <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PoundSterling className="w-8 h-8 text-orange-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Commission Payments Due</h3>
                  <p className="text-gray-300">£{stats.totalCommissionOwed.toFixed(2)} in unpaid commissions</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Review Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}