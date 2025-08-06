import React, { useState, useEffect } from "react";
import { Announcement } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit3, Trash2, MessageSquare, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function AnnouncementManager({ onUpdate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    is_active: true,
    expires_at: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await Announcement.list('-created_date');
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await Announcement.update(editingAnnouncement.id, formData);
      } else {
        await Announcement.create(formData);
      }
      setShowForm(false);
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        message: "",
        type: "info",
        is_active: true,
        expires_at: ""
      });
      loadAnnouncements();
      onUpdate();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        await Announcement.delete(id);
        loadAnnouncements();
        onUpdate();
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await Announcement.update(id, { is_active: !currentStatus });
      loadAnnouncements();
      onUpdate();
    } catch (error) {
      console.error("Error toggling announcement:", error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-500/20 text-blue-400',
      success: 'bg-green-500/20 text-green-400',
      warning: 'bg-yellow-500/20 text-yellow-400',
      urgent: 'bg-red-500/20 text-red-400'
    };
    return colors[type] || colors.info;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Announcements</h2>
          <p className="text-gray-400">Manage messages shown to your team on the dashboard</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingAnnouncement(null);
            setFormData({
              title: "",
              message: "",
              type: "info",
              is_active: true,
              expires_at: ""
            });
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Announcement Form */}
      {showForm && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-300">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="info" className="text-white">Info</SelectItem>
                      <SelectItem value="success" className="text-white">Success</SelectItem>
                      <SelectItem value="warning" className="text-white">Warning</SelectItem>
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
                  className="bg-gray-800 border-gray-700 text-white h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires_at" className="text-gray-300">Expiration Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label className="text-gray-300">Active</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-700 hover:border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {editingAnnouncement ? "Update" : "Create"} Announcement
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`bg-gray-900 border-gray-800 ${!announcement.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        {!announcement.is_active && (
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{announcement.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {format(new Date(announcement.created_date), 'MMM d, yyyy')}
                        </span>
                        {announcement.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expires: {format(new Date(announcement.expires_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(announcement.id, announcement.is_active)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Switch checked={announcement.is_active} readOnly />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(announcement)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
              <h3 className="text-xl font-semibold text-white mb-2">No Announcements</h3>
              <p className="text-gray-400 mb-6">
                Create your first announcement to communicate with your team.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}