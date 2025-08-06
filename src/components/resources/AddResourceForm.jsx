import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send } from "lucide-react";

const categories = [
  { value: "cold_call_scripts", label: "Cold Call Scripts" },
  { value: "email_templates", label: "Email Templates" },
  { value: "sms_templates", label: "SMS Templates" },
  { value: "objection_handling", label: "Objection Handling" },
  { value: "agreements", label: "Agreements" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" }
];

export default function AddResourceForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    content: "",
    file_url: "",
    video_url: "",
    tags: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return;
    
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_active: true
      };
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error submitting resource:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Add New Resource</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 scrollbar-hide">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-gray-800 border-gray-700 text-white" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} required>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-300">Content / Script</Label>
            <Textarea id="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="bg-gray-800 border-gray-700 text-white h-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_url" className="text-gray-300">File URL (e.g., PDF)</Label>
              <Input id="file_url" value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url" className="text-gray-300">Video URL (e.g., YouTube)</Label>
              <Input id="video_url" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-300">Tags (comma-separated)</Label>
            <Input id="tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="bg-gray-800 border-gray-700 text-white" placeholder="e.g. healthcare, opening, closing" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-gray-700 hover:border-gray-600">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Save Resource
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}