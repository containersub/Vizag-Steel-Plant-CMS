// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import './App.css';
import Registration from "./Authentication/Registration";
import LoginPage from "./Authentication/LoginPage";
import AdminDashboard from "./Dashboard/AdminDashboard";
import Dashboard from "./Dashboard/Dashboard"; // Generic dashboard, consider removing if all roles have specific ones
import ContractCellDashboard from "./Dashboard/ContractCellDashboard";
import SectionCoordinatorDashboard from "./Dashboard/SectionCoordinatorDashboard";
import SectionInChargeDashboard from "./Dashboard/SectionInChargeDashboard";
import ServiceEngineerDashboard from "./Dashboard/ServiceEngineerDashboard";
import EtlEicDashboard from "./Dashboard/EtlEicDashboard"; // New dashboard for ETL EIC
import HomePage from "./Home/HomePage";
import { AuthProvider, useAuth } from "./AuthContext";
import Assets from "./etlassets/Assets";
import Pm from "./pm/Pm";
import ReportsPage from "./Reports/ReportsPage";
import ComplaintPage from "./complaints/ComplaintPage";
import Layout from "./Layout";
import UserProfilePage from "./profile/UserProfile";
import AssetsManage from "./etlassets/AssetsManage";
import ComplaintsView from "./complaints/ComplaintsView";

// Import AuthProvider and useAuth

// ProtectedRoute component to handle access control
const ProtectedRoute = ({ children, allowedRoles }) => {
    let {user,isAuthenticated}=useAuth();
    //const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Authenticated but role not allowed, redirect to a forbidden page or home
        // For now, redirect to login, but you might want a more specific "Access Denied" page
        return <Navigate to="/login" replace />;
    }

    return children;
};



function App() {
    
    return (
        <>
            {/* Wrap the entire application with AuthProvider */}
            <BrowserRouter>
                <AuthProvider>
                    
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<Registration />} />
                        <Route
                            path="/users-page"
                            element={
                                <ProtectedRoute allowedRoles={["EIC_Contract", "CONTRACT_ADMIN"]}> {/* Assuming 'EIC_Contract' and 'CONTRACT_ADMIN' roles for UsersPage */}
                                    <Layout>
                                        <UserProfilePage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/assets"
                            element={
                                <ProtectedRoute allowedRoles={["EIC_Contract", "CONTRACT_ADMIN","Contract_Cell","Section_Coordinator","Section_InCharge","Service_Engineer"]}> {/* Assuming 'EIC_Contract' and 'CONTRACT_ADMIN' roles for Assets */}
                                    <Assets />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/preventive-maintenance" element={<Pm/>}/>
                        <Route path="/reports" element={<ReportsPage/>}/>
                        <Route path="/complaints" element={<ComplaintPage/>}/>
                        <Route path="/profile" element={<UserProfilePage/>}/>
                        <Route path="/Assets-page" element={<AssetsManage />} /> {/* Redirect any unknown routes to HomePage */}
                        <Route path="/view-complaints" element={<ComplaintsView/>}/>
                        {/* Protected Routes based on roles */}
                        <Route
                            path="/admin-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["EIC_Contract"]}> {/* Assuming 'ADMIN' role for AdminDashboard */}
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                     
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["DEFAULT_USER"]}> {/* Example for a generic user */}
                                    <Dashboard/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/contract-cell-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["Contract_Cell"]}>
                                    <ContractCellDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/coordinator-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["Section_Coordinator"]}>
                                    <SectionCoordinatorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/incharge-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["Section_InCharge"]}>
                                    <SectionInChargeDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/engineer-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["Service_Engineer"]}>
                                    <ServiceEngineerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/etl-eic-dashboard" // New route for ETL EIC
                            element={
                                <ProtectedRoute allowedRoles={["ETL_EIC"]}>
                                    <EtlEicDashboard />
                                </ProtectedRoute>
                            }
                        />
                        {/* Add more protected routes as needed */}
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </>
    );
}

export default App;
