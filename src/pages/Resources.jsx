import React, { useState, useEffect } from "react";
import { Resource } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

import ResourceCard from "../components/resources/ResourceCard";
import ResourceFilters from "../components/resources/ResourceFilters";
import AddResourceForm from "../components/resources/AddResourceForm";

export default function Resources() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const allResources = await Resource.filter({ is_active: true }, '-created_date');
      setResources(allResources);
    } catch (error) {
      console.error("Error loading resources:", error);
    }
    setLoading(false);
  };

  const handleAddResource = async (resourceData) => {
    try {
      await Resource.create(resourceData);
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const filteredResources = resources.filter(resource => {
    const categoryMatch = activeCategory === 'all' || resource.category === activeCategory;
    const searchMatch = searchTerm === "" || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.tags && resource.tags.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  const categories = [...new Set(resources.map(r => r.category))];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Resource Library</h1>
          <p className="text-gray-400">Scripts, templates, and training materials to help you succeed.</p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <AddResourceForm
              onSubmit={handleAddResource}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search resources by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 focus:border-purple-500"
          />
        </div>
        <ResourceFilters
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Resources Found</h3>
                <p className="text-gray-400">
                  No resources match your current search or filter criteria.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}