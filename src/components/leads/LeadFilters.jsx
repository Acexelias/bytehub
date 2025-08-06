import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

const industries = [
  { value: "all", label: "All Industries" },
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
  { value: "all", label: "All Regions" },
  { value: "scotland", label: "Scotland" },
  { value: "north_england", label: "North England" },
  { value: "midlands", label: "Midlands" },
  { value: "south_england", label: "South England" },
  { value: "wales", label: "Wales" },
  { value: "northern_ireland", label: "Northern Ireland" }
];

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "assigned", label: "Assigned" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "booked", label: "Booked" },
  { value: "no_answer", label: "No Answer" },
  { value: "not_interested", label: "Not Interested" },
  { value: "closed", label: "Closed" }
];

export default function LeadFilters({ filters, onFiltersChange, leads }) {
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      industry: 'all',
      region: 'all'
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-white">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            <Select value={filters.status} onValueChange={(value) => onFiltersChange({...filters, status: value})}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-white hover:bg-gray-700">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.industry} onValueChange={(value) => onFiltersChange({...filters, industry: value})}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value} className="text-white hover:bg-gray-700">
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.region} onValueChange={(value) => onFiltersChange({...filters, region: value})}>
              <SelectTrigger className="w-44 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value} className="text-white hover:bg-gray-700">
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="text-sm text-gray-400">
            Showing {leads.length} leads
          </div>
        </div>
      </CardContent>
    </Card>
  );
}