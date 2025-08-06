import React, { useState, useEffect } from "react";
import { AppConfiguration } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Settings, 
  ExternalLink, 
  Navigation, 
  Save, 
  RefreshCw,
  Plus,
  Trash2,
  GripVertical,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";

const defaultNavItems = [
  { title: "Dashboard", page: "Dashboard", icon: "LayoutDashboard", is_active: true, order: 1 },
  { title: "Leads", page: "Leads", icon: "Users", is_active: true, order: 2 },
  { title: "Resources", page: "Resources", icon: "BookOpen", is_active: true, order: 3 },
  { title: "Commissions", page: "Commissions", icon: "TrendingUp", is_active: true, order: 4 },
  { title: "Support", page: "Support", icon: "MessageCircle", is_active: true, order: 5 }
];

const defaultExternalTools = [
  { title: "AI Assistant", url: "https://ai.byteblitz.co.uk", description: "Internal GPT assistant", icon: "Brain", is_active: true },
  { title: "Automation", url: "https://n8n.byteblitz.co.uk", description: "Workflow dashboard", icon: "Zap", is_active: true },
  { title: "Email Campaigns", url: "https://mautic.byteblitz.co.uk", description: "Campaign management", icon: "Mail", is_active: true },
  { title: "CRM System", url: "https://crm.byteblitz.co.uk", description: "Client tracking", icon: "Database", is_active: true },
  { title: "Booking System", url: "https://cal.byteblitz.co.uk", description: "Schedule meetings", icon: "Calendar", is_active: true }
];

export default function ConfigurationManager({ onUpdate }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const configs = await AppConfiguration.list();
      if (configs.length > 0) {
        setConfig(configs[0]);
      } else {
        // Create default configuration
        const defaultConfig = {
          app_name: "ByteBlitz Staff Hub",
          app_tagline: "Digital Agency CRM",
          primary_color: "#8B5CF6",
          secondary_color: "#EC4899",
          company_phone: "07359 735508",
          navigation_items: defaultNavItems,
          external_tools: defaultExternalTools
        };
        const newConfig = await AppConfiguration.create(defaultConfig);
        setConfig(newConfig);
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await AppConfiguration.update(config.id, config);
      onUpdate();
      alert("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("Error saving configuration");
    }
    setSaving(false);
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addExternalTool = () => {
    const newTool = {
      title: "New Tool",
      url: "https://example.com",
      description: "Tool description",
      icon: "ExternalLink",
      is_active: true
    };
    updateConfig({
      external_tools: [...(config.external_tools || []), newTool]
    });
  };

  const updateExternalTool = (index, updates) => {
    const tools = [...(config.external_tools || [])];
    tools[index] = { ...tools[index], ...updates };
    updateConfig({ external_tools: tools });
  };

  const removeExternalTool = (index) => {
    const tools = [...(config.external_tools || [])];
    tools.splice(index, 1);
    updateConfig({ external_tools: tools });
  };

  const updateNavItem = (index, updates) => {
    const items = [...(config.navigation_items || [])];
    items[index] = { ...items[index], ...updates };
    updateConfig({ navigation_items: items });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-800 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">App Configuration</h2>
          <p className="text-gray-400">Customize branding, navigation, and external tools</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="border-gray-700 hover:border-purple-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview Changes'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>

      {config && (
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="branding" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="navigation" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Navigation className="w-4 h-4 mr-2" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <ExternalLink className="w-4 h-4 mr-2" />
              External Tools
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <div className="grid gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">App Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">App Name</Label>
                      <Input
                        value={config.app_name || ""}
                        onChange={(e) => updateConfig({ app_name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Your App Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Tagline</Label>
                      <Input
                        value={config.app_tagline || ""}
                        onChange={(e) => updateConfig({ app_tagline: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="App tagline or description"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Logo URL</Label>
                    <Input
                      value={config.logo_url || ""}
                      onChange={(e) => updateConfig({ logo_url: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Brand Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.primary_color || "#8B5CF6"}
                          onChange={(e) => updateConfig({ primary_color: e.target.value })}
                          className="w-16 h-10 bg-gray-800 border-gray-700"
                        />
                        <Input
                          value={config.primary_color || "#8B5CF6"}
                          onChange={(e) => updateConfig({ primary_color: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white flex-1"
                          placeholder="#8B5CF6"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.secondary_color || "#EC4899"}
                          onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                          className="w-16 h-10 bg-gray-800 border-gray-700"
                        />
                        <Input
                          value={config.secondary_color || "#EC4899"}
                          onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white flex-1"
                          placeholder="#EC4899"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Support Phone</Label>
                      <Input
                        value={config.company_phone || ""}
                        onChange={(e) => updateConfig({ company_phone: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Support Email</Label>
                      <Input
                        type="email"
                        value={config.company_email || ""}
                        onChange={(e) => updateConfig({ company_email: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="support@company.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Main Navigation Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(config.navigation_items || defaultNavItems).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          value={item.title}
                          onChange={(e) => updateNavItem(index, { title: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Title"
                        />
                        <Input
                          value={item.page}
                          onChange={(e) => updateNavItem(index, { page: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Page"
                        />
                        <Input
                          value={item.icon}
                          onChange={(e) => updateNavItem(index, { icon: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Icon"
                        />
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={(checked) => updateNavItem(index, { is_active: checked })}
                          />
                          <span className="ml-2 text-gray-300 text-sm">Active</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* External Tools Tab */}
          <TabsContent value="tools">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">External Tool Links</CardTitle>
                <Button
                  onClick={addExternalTool}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(config.external_tools || []).map((tool, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input
                          value={tool.title}
                          onChange={(e) => updateExternalTool(index, { title: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Tool Name"
                        />
                        <Input
                          value={tool.url}
                          onChange={(e) => updateExternalTool(index, { url: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="https://tool.example.com"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          value={tool.description}
                          onChange={(e) => updateExternalTool(index, { description: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Tool description"
                        />
                        <Input
                          value={tool.icon}
                          onChange={(e) => updateExternalTool(index, { icon: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Icon name"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Switch
                              checked={tool.is_active}
                              onCheckedChange={(checked) => updateExternalTool(index, { is_active: checked })}
                            />
                            <span className="ml-2 text-gray-300 text-sm">Active</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExternalTool(index)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="grid gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Custom Styling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Favicon URL</Label>
                    <Input
                      value={config.favicon_url || ""}
                      onChange={(e) => updateConfig({ favicon_url: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Custom CSS</Label>
                    <Textarea
                      value={config.custom_css || ""}
                      onChange={(e) => updateConfig({ custom_css: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white h-32 font-mono text-sm"
                      placeholder="/* Custom CSS overrides */"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Settings className="w-6 h-6 text-yellow-400 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Configuration Tips</h3>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Use high-quality images for logos (SVG or PNG recommended)</li>
                        <li>• Test color combinations for accessibility</li>
                        <li>• External tools open in new tabs for user convenience</li>
                        <li>• Custom CSS changes apply globally to the application</li>
                        <li>• Save changes to see them reflected in the interface</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}