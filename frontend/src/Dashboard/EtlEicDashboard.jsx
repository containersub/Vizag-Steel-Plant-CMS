// frontend/src/Dashboards/EtlEicDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, FileText, BarChart2, User, LogOut } from 'lucide-react';

import './Dashboard.css'; // Re-use dashboard styles
import { useAuth } from '../AuthContext';

const EtlEicDashboard = () => {
    let {user,logout}=useAuth();
    //const { user, logout } = useAuth();

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="https://placehold.co/40x40/aabbcc/ffffff?text=CMS" alt="Logo" className="logo" />
                    <h2>CMS</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/etl-eic-dashboard" className="sidebar-link active">
                        <HomeIcon size={20} />
                        Dashboard
                    </Link>
                    {/* Add ETL EIC specific links here */}
                    <Link to="/etl-contracts" className="sidebar-link">
                        <FileText size={20} />
                        View Contracts
                    </Link>
                    <Link to="/etl-reports" className="sidebar-link">
                        <BarChart2 size={20} />
                        Reports
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={logout} className="sidebar-link">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
            <div className="main-content">
                <header className="navbar">
                    <div className="welcome-message">
                        <h1>Welcome, {user?.name || 'ETL EIC'}!</h1>
                        <p className="user-role">{user?.role || 'ETL Dept EIC'} Dashboard</p>
                    </div>
                    <div className="user-profile">
                        <div className="user-avatar">
                            <User size={24} />
                        </div>
                        <span className="user-name">{user?.name || 'ETL EIC'}</span>
                    </div>
                </header>
                <div className="dashboard-grid">
                    {/* ETL EIC specific summary cards or content */}
                    <div className="summary-cards-section">
                        <div className="summary-card">
                            <h3>Contracts Under Review</h3>
                            <p>1</p>
                        </div>
                        <div className="summary-card">
                            <h3>Pending Approvals</h3>
                            <p>0</p>
                        </div>
                    </div>
                    {/* Add more sections relevant to ETL EIC */}
                </div>
            </div>
        </div>
    );
};

export default EtlEicDashboard;
