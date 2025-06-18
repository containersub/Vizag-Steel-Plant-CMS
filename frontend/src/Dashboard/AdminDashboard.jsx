// frontend/src/Dashboards/AdminDashboard.jsx
import { useState,useEffect } from "react";
import './Dashboard.css'; // Import your CSS file for styling
import {
  Home as HomeIcon,
  Box,
  FileText,
  Wrench,
  BarChart2,
  User,
  LogOut,
  PlusCircle,
  Eye,
  Bell,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Layout from "../Layout";
 // Import useAuth

const mockDashboardData = {
  totalAssets: 120,
  openComplaints: 15,
  pendingPMTasks: 8,
  assetDistribution: [
    { name: "IT", assets: 40 },
    { name: "HR", assets: 30 },
    { name: "Finance", assets: 20 },
    { name: "Operations", assets: 30 },
  ],
  recentActivity: [
    {
      id: 1,
      type: "Complaint",
      description: "Complaint #123 resolved",
      date: "2024-06-01",
    },
    {
      id: 2,
      type: "PM Task",
      description: "PM Task #456 completed",
      date: "2024-06-02",
    },
    {
      id: 3,
      type: "Asset",
      description: "New asset added: Laptop",
      date: "2024-06-03",
    },
  ],
};

function AdminDashboard() {
  const [totalPmTasks, setTotalPmTasks] = useState(0);
  const [loadingPmCount, setLoadingPmCount] = useState(true);
  const [errorPmCount, setErrorPmCount] = useState(null);


   const [totalAssets, setTotalAssets] = useState(0);
   const [totalComplaints, setTotalComplaints] = useState(0); // New state for total complaints
  const [userData] = useState(mockDashboardData);
  let{user,logout}=useAuth();// Get user and logout from AuthContext


useEffect(() => {
  
  const fetchPmTaskCount = async () => {
      setLoadingPmCount(true);
      setErrorPmCount(null);
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage

        if (!token) {
          setErrorPmCount("Authentication token not found. Please log in.");
          setLoadingPmCount(false);
          return;
        }

        const response = await fetch('http://localhost:8080/ContractManagementSystem/pm-tasks/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the JWT token
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch PM task count');
        }

        const data = await response.json();
        setTotalPmTasks(data.totalPmTasks); // Access the 'totalPmTasks' key from the JSON response
      } catch (error) {
        console.error("Error fetching PM task count:", error);
        setErrorPmCount(error.message);
      } finally {
        setLoadingPmCount(false);
      }
    };

    fetchPmTaskCount();

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user')); // Assuming user data is stored

        if (!token || !user) {
            console.error('Authentication token or user data not found.');
            return;
        }

        try {
            // Fetch Total Assets (allowed for all roles)
            const assetsResponse = await fetch('http://localhost:8080/ContractManagementSystem/assets/total', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!assetsResponse.ok) {
                const errorData = await assetsResponse.json();
                console.error('Failed to fetch total assets:', errorData.message);
                setTotalAssets('N/A');
            } else {
                const data = await assetsResponse.json();
                setTotalAssets(data.total_assets);
            }

            // Only fetch complaints if user is admin or service_engineer
            if (user.role === 'admin' || user.role === 'service_engineer' || user.role === 'EIC_Contract') {
                const complaintsResponse = await fetch('http://localhost:8080/ContractManagementSystem/complaints/total', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!complaintsResponse.ok) {
                    const errorData = await complaintsResponse.json();
                    console.error('Failed to fetch total complaints:', errorData.message);
                    setTotalComplaints('N/A');
                } else {
                    const data = await complaintsResponse.json();
                    setTotalComplaints(data.total_complaints);
                }
            } else {
                setTotalComplaints('Not Allowed'); // Or hide this section entirely
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setTotalAssets('Error');
            setTotalComplaints('Error');
        }
    };

    fetchDashboardData();
}, [user]); // Re-run effect if user changes // Re-run effect if user changes (e.g., after login)

  return (
    <Layout>
      <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          {/* You can replace this with your actual logo */}
          <img src="https://placehold.co/40x40/aabbcc/ffffff?text=CMS" alt="Logo" className="logo" />
          <h2>CMS</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="sidebar-link active">
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
          <Link to="/reports" className="sidebar-link">
            <BarChart2 size={20} />
            Reports
          </Link>
          <Link to="/Users-page" className="sidebar-link">
            <User size={20} />
            Users
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
            <div className="summary-card total-assets">
              <h3>Total Assets</h3>
              <p>{totalAssets}</p>
            </div>
            <div className="summary-card open-complaints">
              <h3>Total Complaints</h3> {/* Changed label to Total Complaints */}
              <p>{totalComplaints}</p> {/* Display totalComplaints */}
            </div>
            <div className="summary-card pending-tasks">
              <h3>Pending PM Tasks</h3>
              {loadingPmCount ? (
            <p>Loading...</p>
          ) : errorPmCount ? (
            <p className="error-message">Error: {errorPmCount}</p>
          ) : (
            <p className="count">{totalPmTasks}</p>
          )}
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card asset-distribution">
              <h3>Asset Distribution by Department</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userData.assetDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="assets" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
              <Link to="/Reports-page" className="quick-link-button">
                <BarChart2 size={28} />
                View Reports
              </Link>
            </div>
          </div>

          <div className="recent-activity-section">
            <div className="section-header">
              <Bell size={24} />
              <h2>Recent Activity</h2>
            </div>
            <ul className="recent-activity-list">
              {userData.recentActivity.map((activity) => (
                <li key={activity.id} className="recent-activity-item">
                  <span
                    className={`activity-icon ${activity.type
                      .toLowerCase()
                      .replace(/\s/g, "-")}`}
                  >
                    {activity.type === "Complaint" && <AlertCircle size={20} />}
                    {activity.type === "PM Task" && <Wrench size={20} />}
                    {activity.type === "Asset" && <HardDrive size={20} />}
                  </span>
                  <span className="activity-description">
                    {activity.description}
                  </span>
                  <span className="activity-date">{activity.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}

export default AdminDashboard;