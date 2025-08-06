import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send } from "lucide-react";

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

export default function LeadRequestForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    industry: "",
    region: "",
    quantity: 10,
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.industry || !formData.region) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting request:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Request New Leads</CardTitle>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-gray-300">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value} className="text-white hover:bg-gray-700">
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-gray-300">Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value} className="text-white hover:bg-gray-700">
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-gray-300">Number of Leads</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">Additional Requirements</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any specific requirements or notes..."
              className="bg-gray-800 border-gray-700 text-white h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-700 hover:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.industry || !formData.region}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}