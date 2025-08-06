import React, { useState, useEffect } from "react";
import { SupportTicket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SupportManager({ onUpdate }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await SupportTicket.list('-created_date');
      setTickets(data);
    } catch (error) {
      console.error("Error loading support tickets:", error);
    }
    setLoading(false);
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const updates = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      await SupportTicket.update(ticketId, updates);
      loadTickets();
      onUpdate();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const submitResponse = async (ticketId) => {
    if (!response.trim()) return;
    
    try {
      await SupportTicket.update(ticketId, {
        admin_response: response,
        status: 'resolved',
        resolved_at: new Date().toISOString()
      });
      setRespondingTo(null);
      setResponse("");
      loadTickets();
      onUpdate();
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400'
    };
    return colors[priority] || colors.medium;
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
      case 'open': return AlertCircle;
      case 'in_progress': return Clock;
      case 'resolved': return CheckCircle2;
      case 'closed': return CheckCircle2;
      default: return MessageSquare;
    }
  };

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
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Support Tickets</h2>
        <p className="text-gray-400">Manage support requests from your team members</p>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => {
            const StatusIcon = getStatusIcon(ticket.status);
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`bg-gray-900 border-gray-800 ${ticket.status === 'open' ? 'border-red-500/30' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${
                          ticket.status === 'open' ? 'text-red-400' :
                          ticket.status === 'in_progress' ? 'text-yellow-400' :
                          'text-green-400'
                        }`} />
                        <div>
                          <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">{ticket.submitted_by}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">{format(new Date(ticket.created_date), 'MMM d, yyyy HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    {ticket.admin_response && (
                      <div className="mb-4 p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                        <p className="text-sm font-medium text-purple-400 mb-2">Admin Response:</p>
                        <p className="text-gray-300 whitespace-pre-wrap">{ticket.admin_response}</p>
                        {ticket.resolved_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Resolved: {format(new Date(ticket.resolved_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <>
                            <Select
                              value={ticket.status}
                              onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="open" className="text-white">Open</SelectItem>
                                <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                                <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRespondingTo(respondingTo === ticket.id ? null : ticket.id)}
                              className="border-gray-700 hover:border-purple-500"
                            >
                              {respondingTo === ticket.id ? 'Cancel' : 'Respond'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {respondingTo === ticket.id && (
                      <div className="mt-4 space-y-3">
                        <Textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Write your response to the team member..."
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => submitResponse(ticket.id)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            disabled={!response.trim()}
                          >
                            Send Response & Close
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRespondingTo(null);
                              setResponse("");
                            }}
                            className="border-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Support Tickets</h3>
              <p className="text-gray-400">
                All support requests from your team will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}