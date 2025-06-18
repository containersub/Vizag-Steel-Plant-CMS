// SectionCoordinatorDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Box, FileText, Wrench, BarChart2, User, LogOut, PlusCircle, Eye, Bell } from 'lucide-react';
// Assuming Layout is in the same directory
// Common styles
import Layout from '../Layout';
import { useAuth } from '../AuthContext';



const SectionCoordinatorDashboard = () => {
  let { user, logout } = useAuth(); // Use the AuthContext to get user and logout function
  // Mock data for Section Coordinator
  // In a real application, this would come from an API call
  
  return (
    <Layout>
     <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          {/* You can replace this with your actual logo */}
          <img src="https://placehold.co/40x40/aabbcc/ffffff?text=SC" alt="Logo" className="logo" />
          <h2>SC</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/coordinator-dashboard" className="sidebar-link active">
            <HomeIcon size={20} />
            Dashboard
          </Link>
          <Link to="/assets" className="sidebar-link">
            <Box size={20} />
            Assets
          </Link>
          <Link to="/complaints" className="sidebar-link">
            <FileText size={20} />
            Complaints
          </Link>
          <Link to="/preventive-maintenance" className="sidebar-link">
            <Wrench size={20} />
            PM Tasks
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-link"> {/* Use a button for logout */}
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="navbar">
          <div className="welcome-message">
            <h1>Welcome, {user?.name || 'Admin'}!</h1> {/* Use user from context */}
            <p className="user-role">{user?.role || 'Admin'} Dashboard</p> {/* Use user from context */}
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <span className="user-name">{user?.name || 'Admin'}</span> {/* Use user from context */}
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="summary-cards-section">
           
          </div>

          <div className="charts-section">
            
          </div>

          <div className="quick-links-section">
            <div className="section-header">
              <PlusCircle size={24} />
              <h2>Quick Links</h2>
            </div>
            <div className="quick-links-grid">
              <Link to="/complaints" className="quick-link-button">
                <FileText size={28} />
                Create Complaint
              </Link>
              <Link to="/preventive-maintenance" className="quick-link-button">
                <Wrench size={28} />
                Create PM Task
              </Link>
              <Link to="/view-complaints" className="quick-link-button">
                <Eye size={28} />
                View Complaints
              </Link>
              <Link to="/Assets-page" className="quick-link-button">
                <Box size={28} />
                Manage Assets
              </Link>
              
            </div>
          </div>

          <div className="recent-activity-section">
            <div className="section-header">
              <Bell size={24} />
              <h2>Recent Activity</h2>
            </div>
            <ul className="recent-activity-list">
              
            </ul>
          </div>
        </div>
      </div>
    </div>

    </Layout>
  );
};

export default SectionCoordinatorDashboard;