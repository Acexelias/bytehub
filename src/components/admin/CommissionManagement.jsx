import React, { useState, useEffect } from "react";
import { Sale } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, PoundSterling, Calendar, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function CommissionManagement({ onUpdate }) {
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allSales, allUsers] = await Promise.all([
        Sale.list('-created_date'),
        User.list()
      ]);
      setSales(allSales);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading commission data:", error);
    }
    setLoading(false);
  };

  const markCommissionPaid = async (saleId) => {
    try {
      await Sale.update(saleId, { commission_paid: true });
      loadData();
      onUpdate();
    } catch (error) {
      console.error("Error marking commission as paid:", error);
    }
  };

  const getRepName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const unpaidSales = sales.filter(sale => !sale.commission_paid);
  const totalUnpaid = unpaidSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);

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
      <div className="space-y-4">
        <div className="h-24 bg-gray-800 rounded-lg animate-pulse"></div>
        <div className="h-96 bg-gray-800 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Unpaid Commissions</p>
                <p className="text-2xl font-bold text-white">£{totalUnpaid.toFixed(2)}</p>
              </div>
              <PoundSterling className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending Sales</p>
                <p className="text-2xl font-bold text-white">{unpaidSales.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-white">{sales.length}</p>
              </div>
              <UserIcon className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Commission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Client</TableHead>
                  <TableHead className="text-gray-400">Rep</TableHead>
                  <TableHead className="text-gray-400">Sale Amount</TableHead>
                  <TableHead className="text-gray-400">Commission</TableHead>
                  <TableHead className="text-gray-400">Sale Date</TableHead>
                  <TableHead className="text-gray-400">Payment Status</TableHead>
                  <TableHead className="text-gray-400">Action</TableHead>
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
                    <TableCell className="text-white font-medium">
                      {sale.client_name}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {getRepName(sale.rep_email)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      £{sale.sale_amount?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      £{sale.commission_amount?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(sale.sale_date || sale.created_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(sale.payment_status)}>
                        {sale.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!sale.commission_paid ? (
                        <Button
                          size="sm"
                          onClick={() => markCommissionPaid(sale.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark Paid
                        </Button>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400">
                          Paid
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
              <h3 className="text-xl font-semibold text-white mb-2">No Sales Yet</h3>
              <p className="text-gray-400">Sales and commissions will appear here once deals are closed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}