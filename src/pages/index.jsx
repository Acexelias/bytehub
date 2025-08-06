import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Leads from "./Leads";

import Resources from "./Resources";

import Admin from "./Admin";

import Commissions from "./Commissions";

import Support from "./Support";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Leads: Leads,
    
    Resources: Resources,
    
    Admin: Admin,
    
    Commissions: Commissions,
    
    Support: Support,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Resources" element={<Resources />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Commissions" element={<Commissions />} />
                
                <Route path="/Support" element={<Support />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}