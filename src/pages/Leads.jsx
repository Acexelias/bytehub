import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Lead } from "@/api/entities";
import { LeadRequest } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  Building2,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import LeadRequestForm from "../components/leads/LeadRequestForm";
import LeadCard from "../components/leads/LeadCard";
import LeadFilters from "../components/leads/LeadFilters";

export default function Leads() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadRequests, setLeadRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    region: 'all'
  });
  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load user's assigned leads
      const userLeads = await Lead.filter({ assigned_to: currentUser.email }, '-created_date');
      setLeads(userLeads);

      // Load user's lead requests
      const userRequests = await LeadRequest.filter({ requested_by: currentUser.email }, '-created_date');
      setLeadRequests(userRequests);

    } catch (error) {
      console.error("Error loading leads data:", error);
    }
    setLoading(false);
  };

  const handleRequestSubmit = async (requestData) => {
    try {
      await LeadRequest.create({
        ...requestData,
        requested_by: user.email
      });
      setShowRequestForm(false);
      loadData();
    } catch (error) {
      console.error("Error submitting lead request:", error);
    }
  };

  const handleLeadUpdate = async (leadId, updates) => {
    try {
      await Lead.update(leadId, updates);
      loadData();
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const exportLeads = () => {
    const filteredLeads = getFilteredLeads();
    const csvContent = [
      ['Company', 'Contact', 'Email', 'Phone', 'Industry', 'Region', 'Status', 'Notes'].join(','),
      ...filteredLeads.map(lead => [
        lead.company_name,
        lead.contact_name,
        lead.email || '',
        lead.phone || '',
        lead.industry,
        lead.region,
        lead.status,
        lead.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      if (filters.status !== 'all' && lead.status !== filters.status) return false;
      if (filters.industry !== 'all' && lead.industry !== filters.industry) return false;
      if (filters.region !== 'all' && lead.region !== filters.region) return false;
      return true;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-gray-500/20 text-gray-400',
      contacted: 'bg-blue-500/20 text-blue-400',
      replied: 'bg-yellow-500/20 text-yellow-400',
      booked: 'bg-green-500/20 text-green-400',
      no_answer: 'bg-orange-500/20 text-orange-400',
      not_interested: 'bg-red-500/20 text-red-400',
      closed: 'bg-purple-500/20 text-purple-400'
    };
    return colors[status] || colors.assigned;
  };

  const getRequestStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-blue-500/20 text-blue-400',
      fulfilled: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lead Management</h1>
          <p className="text-gray-400">Manage your assigned leads and request new ones</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportLeads}
            variant="outline"
            className="border-gray-700 hover:border-purple-500"
            disabled={leads.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowRequestForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Leads
          </Button>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <LeadRequestForm
              onSubmit={handleRequestSubmit}
              onCancel={() => setShowRequestForm(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="assigned" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            Assigned Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            My Requests ({leadRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Assigned Leads Tab */}
        <TabsContent value="assigned" className="space-y-6">
          {/* Filters */}
          <LeadFilters
            filters={filters}
            onFiltersChange={setFilters}
            leads={leads}
          />

          {/* Leads Grid */}
          <div className="grid gap-6">
            {getFilteredLeads().length > 0 ? (
              getFilteredLeads().map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onUpdate={handleLeadUpdate}
                />
              ))
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Leads Found</h3>
                  <p className="text-gray-400 mb-6">
                    {leads.length === 0 
                      ? "You don't have any assigned leads yet. Request some leads to get started!"
                      : "No leads match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  <Button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Leads
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Lead Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-4">
            {leadRequests.length > 0 ? (
              leadRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">
                              {request.quantity} {request.industry.replace(/_/g, ' ')} leads
                            </h3>
                            <Badge className={getRequestStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span>Region: {request.region.replace(/_/g, ' ')}</span>
                            <span>Requested: {format(new Date(request.created_date), 'MMM d, yyyy')}</span>
                          </div>
                          {request.notes && (
                            <p className="text-gray-300 mt-2">{request.notes}</p>
                          )}
                          {request.admin_notes && (
                            <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Admin Response:</p>
                              <p className="text-gray-300">{request.admin_notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <Clock className="w-5 h-5 text-yellow-400" />
                          )}
                          {request.status === 'fulfilled' && (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          )}
                          {request.status === 'rejected' && (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Requests Yet</h3>
                  <p className="text-gray-400 mb-6">
                    You haven't submitted any lead requests. Request leads to get started!
                  </p>
                  <Button
                    onClick={() => setShowRequestForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Leads
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}