import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Sale } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PoundSterling, TrendingUp, Clock, CheckCircle2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Commissions() {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingPayout: 0,
    paidOut: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommissionData();
  }, []);

  const loadCommissionData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const userSales = await Sale.filter({ rep_email: currentUser.email }, '-created_date');
      setSales(userSales);

      // Calculate stats
      const totalEarned = userSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
      const pendingPayout = userSales
        .filter(sale => !sale.commission_paid)
        .reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
      const paidOut = totalEarned - pendingPayout;

      setStats({
        totalEarned,
        pendingPayout,
        paidOut,
        totalSales: userSales.length
      });
    } catch (error) {
      console.error("Error loading commission data:", error);
    }
    setLoading(false);
  };

  const statCards = [
    {
      title: "Total Commission Earned",
      value: `£${stats.totalEarned.toFixed(2)}`,
      icon: PoundSterling,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Pending Payout",
      value: `£${stats.pendingPayout.toFixed(2)}`,
      icon: Clock,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Total Paid Out",
      value: `£${stats.paidOut.toFixed(2)}`,
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Sales Made",
      value: stats.totalSales,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    }
  ];

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      paid: 'bg-green-500/20 text-green-400',
      overdue: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">My Commissions</h1>
        <p className="text-gray-400">Track your earnings, payments, and sales performance.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-800 overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-200`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commission Log Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Commission Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Client</TableHead>
                    <TableHead className="text-gray-400">Sale Amount</TableHead>
                    <TableHead className="text-gray-400">Commission</TableHead>
                    <TableHead className="text-gray-400">Sale Date</TableHead>
                    <TableHead className="text-gray-400">Payment Status</TableHead>
                    <TableHead className="text-gray-400">Commission Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-gray-800"
                    >
                      <TableCell className="text-white font-medium">{sale.client_name}</TableCell>
                      <TableCell className="text-gray-300">£{sale.sale_amount?.toFixed(2)}</TableCell>
                      <TableCell className="text-green-400 font-semibold">£{sale.commission_amount?.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300">{format(new Date(sale.sale_date || sale.created_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(sale.payment_status)}>
                          {sale.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.commission_paid ? (
                          <Badge className="bg-green-500/20 text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
            {sales.length === 0 && (
              <div className="text-center py-12">
                <PoundSterling className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Commissions Yet</h3>
                <p className="text-gray-400">Your sales and commissions will appear here once deals are closed.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}