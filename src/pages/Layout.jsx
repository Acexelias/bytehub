
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { AppConfiguration } from "@/api/entities";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  Settings,
  ExternalLink,
  Menu,
  X,
  Zap,
  Brain,
  Mail,
  Database,
  Calendar,
  Shield,
  LogOut,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Icon mapping for dynamic icons
const iconMap = {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Settings,
  ExternalLink,
  Zap,
  Brain,
  Mail,
  Database,
  Calendar,
  Shield
};

const defaultNavItems = [
  {
    title: "Dashboard",
    page: "Dashboard",
    icon: "LayoutDashboard",
    is_active: true,
    order: 1
  },
  {
    title: "Leads",
    page: "Leads", 
    icon: "Users",
    is_active: true,
    order: 2
  },
  {
    title: "Resources",
    page: "Resources",
    icon: "BookOpen",
    is_active: true,
    order: 3
  },
  {
    title: "Commissions",
    page: "Commissions",
    icon: "TrendingUp", 
    is_active: true,
    order: 4
  },
  {
    title: "Support",
    page: "Support",
    icon: "MessageCircle",
    is_active: true,
    order: 5
  }
];

const defaultExternalTools = [
  {
    title: "AI Assistant",
    url: "https://ai.byteblitz.co.uk",
    description: "Internal GPT assistant",
    icon: "Brain",
    is_active: true
  },
  {
    title: "Automation Hub",
    url: "https://n8n.byteblitz.co.uk",
    description: "Workflow automation",
    icon: "Zap",
    is_active: true
  },
  {
    title: "Email Campaigns",
    url: "https://mautic.byteblitz.co.uk", 
    description: "Campaign management",
    icon: "Mail",
    is_active: true
  },
  {
    title: "CRM System",
    url: "https://crm.byteblitz.co.uk",
    description: "Client tracking",
    icon: "Database",
    is_active: true
  },
  {
    title: "Booking System", 
    url: "https://cal.byteblitz.co.uk",
    description: "Schedule meetings",
    icon: "Calendar",
    is_active: true
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadUserAndConfig();
  }, []);

  const loadUserAndConfig = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load app configuration
      const configs = await AppConfiguration.list();
      if (configs.length > 0) {
        setConfig(configs[0]);
      }
    } catch (error) {
      // User not authenticated - redirect to login
      await User.loginWithRedirect(window.location.href);
      return;
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
  };

  // Build navigation items from config or defaults
  const getNavigationItems = () => {
    const navItems = config?.navigation_items || defaultNavItems;
    const activeNavItems = navItems.filter(item => item.is_active !== false);
    
    return activeNavItems
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        title: item.title,
        url: createPageUrl(item.page),
        page: item.page,
        icon: iconMap[item.icon] || LayoutDashboard
      }));
  };

  // Build external tools from config or defaults  
  const getExternalTools = () => {
    const tools = config?.external_tools || defaultExternalTools;
    return tools.filter(tool => tool.is_active !== false);
  };

  const appName = config?.app_name || "ByteBlitz Staff Hub";
  const appTagline = config?.app_tagline || "Digital Agency CRM";
  const logoUrl = config?.logo_url; 
  const primaryColor = config?.primary_color || "#8B5CF6";
  const secondaryColor = config?.secondary_color || "#EC4899";
  const supportPhone = config?.company_phone || "07359 735508";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Red Hat+Display:wght@300;400;500;600;700;800;900&display=swap');
            body { font-family: 'Red Hat Display', sans-serif; }
          `}
        </style>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white font-medium">Loading {appName}...</span>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems();
  const externalTools = getExternalTools();

  return (
    <div className="min-h-screen bg-black text-white" style={{fontFamily: 'Red Hat Display, sans-serif'}}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Red Hat+Display:wght@300;400;500;600;700;800;900&display=swap');
          
          :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --purple-gradient: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          }
          
          body { 
            font-family: 'Red Hat Display', sans-serif;
            background: #000000;
          }

          ${config?.custom_css || ''}
        `}
      </style>

      {/* Favicon */}
      {config?.favicon_url && (
        <link rel="icon" href={config.favicon_url} />
      )}

      {/* Mobile Menu Button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 hover:bg-gray-800 border border-gray-800"
        size="icon"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-gray-950 border-r border-gray-800 flex flex-col lg:translate-x-0"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                {logoUrl ? (
                  <img src={logoUrl} alt={appName} className="w-10 h-10 rounded-xl" />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                    }}
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-lg text-white">{appName}</h1>
                  <p className="text-xs text-gray-400">{appTagline}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-semibold">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.full_name || user?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {user?.role || 'user'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Navigation
                </p>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url || 
                    (item.page && currentPageName === item.page);
                  
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Admin Panel */}
              {user?.role === 'admin' && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Administration
                  </p>
                  <Link
                    to={createPageUrl("Admin")}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      currentPageName === 'Admin'
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                    {currentPageName === 'Admin' && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    )}
                  </Link>
                </div>
              )}

              {/* External Tools */}
              {externalTools.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    External Tools
                  </p>
                  {externalTools.map((tool) => {
                    const Icon = iconMap[tool.icon] || ExternalLink;
                    return (
                      <a
                        key={tool.title}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 group"
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium block">{tool.title}</span>
                          {tool.description && (
                            <span className="text-xs text-gray-500 block truncate">
                              {tool.description}
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 space-y-3">
              {supportPhone && (
                <a
                  href={`tel:${supportPhone}`}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Support: {supportPhone}</span>
                </a>
              )}
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
