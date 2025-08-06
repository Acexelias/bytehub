import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SupportTicket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Support() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const userTickets = await SupportTicket.filter({ submitted_by: currentUser.email }, '-created_date');
      setTickets(userTickets);
    } catch (error) {
      console.error("Error loading support data:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;
    setSubmitting(true);
    try {
      await SupportTicket.create({
        ...formData,
        submitted_by: user.email,
        status: "open",
      });
      setFormData({ subject: "", message: "", priority: "medium" });
      loadSupportData();
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
    setSubmitting(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-red-500/20 text-red-400',
      in_progress: 'bg-yellow-500/20 text-yellow-400',
      resolved: 'bg-green-500/20 text-green-400',
      closed: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status] || colors.open;
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 mr-1" />;
      case 'in_progress': return <Clock className="w-4 h-4 mr-1" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-800 rounded-lg"></div>
            <div className="h-48 bg-gray-800 rounded-lg"></div>
          </div>
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
        <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
        <p className="text-gray-400">Get help with leads, commissions, or system issues.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Submit a Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="e.g., Commission discrepancy"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="low" className="text-white">Low</SelectItem>
                        <SelectItem value="medium" className="text-white">Medium</SelectItem>
                        <SelectItem value="high" className="text-white">High</SelectItem>
                        <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white h-32"
                    placeholder="Please describe your issue in detail..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 h-full">
            <CardHeader>
              <CardTitle className="text-white">Direct Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">For urgent issues, you can reach Elias directly.</p>
              <a href="tel:07359735508" className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <Phone className="w-4 h-4 mr-2" />
                  07359 735508
                </Button>
              </a>
              <a href="mailto:elias@byteblitz.co.uk" className="block">
                <Button variant="outline" className="w-full justify-start border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <Mail className="w-4 h-4 mr-2" />
                  elias@byteblitz.co.uk
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-white mb-4">My Ticket History</h2>
        <div className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map(ticket => (
              <Card key={ticket.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                      <p className="text-sm text-gray-500">
                        Submitted: {format(new Date(ticket.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{ticket.message}</p>
                  {ticket.admin_response && (
                    <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-400 mb-2">Response from Elias:</p>
                      <p className="text-gray-300 whitespace-pre-wrap">{ticket.admin_response}</p>
                       {ticket.resolved_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Resolved: {format(new Date(ticket.resolved_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tickets Found</h3>
                <p className="text-gray-400">Your submitted support tickets will appear here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}