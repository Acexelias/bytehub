import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { LeadRequest } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserCheck, Clock, CheckCircle2, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function LeadAssignment({ onUpdate }) {
  const [leadRequests, setLeadRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    industry: "",
    region: "",
    assigned_to: "",
    estimated_value: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requests, teamMembers] = await Promise.all([
        LeadRequest.list('-created_date'),
        User.list()
      ]);
      setLeadRequests(requests);
      setUsers(teamMembers.filter(u => u.role === 'user'));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await Lead.create({
        ...formData,
        status: 'assigned',
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null
      });
      setShowAddForm(false);
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        industry: "",
        region: "",
        assigned_to: "",
        estimated_value: "",
        notes: ""
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };

  const handleRequestAction = async (requestId, action, adminNotes = "") => {
    try {
      await LeadRequest.update(requestId, {
        status: action,
        admin_notes: adminNotes
      });
      loadData();
      onUpdate();
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-blue-500/20 text-blue-400',
      fulfilled: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const industries = [
    { value: "retail", label: "Retail" },
    { value: "hospitality", label: "Hospitality" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "construction", label: "Construction" },
    { value: "professional_services", label: "Professional Services" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "other", label: "Other" }
  ];

  const regions = [
    { value: "scotland", label: "Scotland" },
    { value: "north_england", label: "North England" },
    { value: "midlands", label: "Midlands" },
    { value: "south_england", label: "South England" },
    { value: "wales", label: "Wales" },
    { value: "northern_ireland", label: "Northern Ireland" }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Lead Management</h2>
          <p className="text-gray-400">Review requests and assign leads to team members</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Manual Lead
        </Button>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Add New Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Company Name</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Contact Name</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value} className="text-white">
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value} className="text-white">
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Assign To</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => setFormData({...formData, assigned_to: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {users.map((user) => (
                        <SelectItem key={user.email} value={user.email} className="text-white">
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Estimated Value (£)</Label>
                  <Input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({...formData, estimated_value: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Add Lead
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lead Requests */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lead Requests from Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadRequests.length > 0 ? (
              leadRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <UserCheck className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">
                          {request.quantity} {request.industry.replace(/_/g, ' ')} leads
                        </h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 mb-3">
                        <span>Requested by: {request.requested_by}</span>
                        <span>Region: {request.region.replace(/_/g, ' ')}</span>
                        <span>Date: {format(new Date(request.created_date), 'MMM d, yyyy')}</span>
                      </div>
                      {request.notes && (
                        <p className="text-gray-300 mb-3">Notes: {request.notes}</p>
                      )}
                      {request.admin_notes && (
                        <div className="p-3 bg-gray-700 rounded-lg mb-3">
                          <p className="text-sm text-gray-400 mb-1">Admin Response:</p>
                          <p className="text-gray-300">{request.admin_notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(request.id, 'approved', 'Request approved - leads will be assigned shortly')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, 'rejected', 'Request declined - please reach out for more details')}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'fulfilled', 'Leads have been assigned to your account')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Fulfilled
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No lead requests yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}