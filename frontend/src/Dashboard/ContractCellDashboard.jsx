// frontend/src/Dashboards/ContractCellDashboard.jsx
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react'; // Import LogOut and User icons
import { useAuth } from '../AuthContext';
import Layout from '../Layout';
 // Import useAuth

const ContractCellDashboard = () => {
    let{user,logout}=useAuth();
   // const { user, logout } = useAuth(); // Get user and logout from AuthContext

    return (
        <Layout>
            <div className="dashboard-container"> {/* Re-use dashboard styles */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    {/* You can replace this with your actual logo */}
                    <img src="https://placehold.co/40x40/aabbcc/ffffff?text=CMS" alt="Logo" className="logo" />
                    <h2>CMS</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/contract-cell-dashboard" className="sidebar-link active">
                        Dashboard
                    </Link>
                    {/* Add Contract Cell specific links here */}
                    <Link to="/contracts" className="sidebar-link">
                        Manage Contracts
                    </Link>
                    <Link to="/vendors" className="sidebar-link">
                        Vendors
                    </Link>
                    <Link to="/assets" className="sidebar-link">
                        Assets
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
                        <h1>Welcome, {user?.name || 'User'}!</h1>
                        <p className="user-role">{user?.role || 'Contract Cell'} Dashboard</p>
                    </div>
                    <div className="user-profile">
                        <div className="user-avatar">
                            <User size={24} /> {/* Assuming User icon is imported */}
                        </div>
                        <span className="user-name">{user?.name || 'User'}</span>
                    </div>
                </header>
                <div className="dashboard-grid">
                    <div className="summary-cards-section">
                        {/* Summary cards relevant to Contract Cell */}
                        <div className="summary-card">
                            <h3>Active Contracts</h3>
                            <p>50</p>
                        </div>
                        <div className="summary-card">
                            <h3>Pending Renewals</h3>
                            <p>5</p>
                        </div>
                    </div>
                    {/* Add charts or other sections relevant to Contract Cell */}
                </div>
            </div>
        </div>
        </Layout>
    );
};

export default ContractCellDashboard;
