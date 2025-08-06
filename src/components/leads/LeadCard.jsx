import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Calendar,
  Edit3,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "assigned", label: "Assigned", color: "bg-gray-500/20 text-gray-400" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500/20 text-blue-400" },
  { value: "replied", label: "Replied", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "booked", label: "Booked", color: "bg-green-500/20 text-green-400" },
  { value: "no_answer", label: "No Answer", color: "bg-orange-500/20 text-orange-400" },
  { value: "not_interested", label: "Not Interested", color: "bg-red-500/20 text-red-400" },
  { value: "closed", label: "Closed", color: "bg-purple-500/20 text-purple-400" }
];

export default function LeadCard({ lead, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: lead.status,
    notes: lead.notes || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(lead.id, {
        ...editData,
        last_contacted: editData.status !== lead.status ? new Date().toISOString().split('T')[0] : lead.last_contacted
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating lead:", error);
    }
    setLoading(false);
  };

  const getStatusOption = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Lead Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    {lead.company_name}
                  </h3>
                  <p className="text-gray-400 flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    {lead.contact_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusOption(lead.status).color}>
                    {getStatusOption(lead.status).label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {lead.email && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${lead.phone}`} className="hover:text-white transition-colors">
                      {lead.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span className="capitalize">{lead.industry?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{lead.region?.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {lead.estimated_value && (
                <div className="mb-4">
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    Est. Value: £{lead.estimated_value}
                  </Badge>
                </div>
              )}

              {lead.last_contacted && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  Last contacted: {format(new Date(lead.last_contacted), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Edit Panel or Notes */}
            <div className="lg:w-80">
              {isEditing ? (
                <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Status</label>
                    <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Notes</label>
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      placeholder="Add notes about this lead..."
                      className="bg-gray-700 border-gray-600 text-white h-24"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-gray-600 hover:border-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {lead.notes && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Notes</h4>
                      <p className="text-gray-400 text-sm whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}

                  {lead.tags && lead.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full border-gray-700 hover:border-purple-500 hover:bg-purple-500/10"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Update Lead
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}