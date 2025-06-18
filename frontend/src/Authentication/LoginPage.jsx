// frontend/src/Authentication/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css' // Assuming you have a CSS file for authentication forms
import { useAuth } from '../AuthContext';

import toast, { Toaster } from 'react-hot-toast';

// Import useAuth

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    let {login, isAuthenticated, user} = useAuth();
    
    //const { login } = useAuth(); // Get the login function from AuthContext

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect based on user role
            switch (user.role) {
                case 'EIC_Contract':
                    navigate('/admin-dashboard');
                    break;
                case 'CONTRACT_ADMIN':
                    navigate('/etl-eic-dashboard');
                    break;
                case 'Contract_Cell':
                    navigate('/');
                    break;
                case 'Section_Coordinator':
                    navigate('/coordinator-dashboard');
                    break;
                case 'Section_InCharge':
                    navigate('/incharge-dashboard');
                    break;
                case 'Service_Engineer':
                    navigate('/engineer-dashboard');
                    break;
                case 'Others':
                    navigate('/dashboard');
                    break;    
                default:
                    navigate('/dashboard'); // Fallback for unknown roles
                    break;
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            const response = await fetch('http://localhost:8080/ContractManagementSystem/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token); // Store token in local storage
                localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in local storage

                // Login successful
                toast.success('Login Successful');
                // Removed incorrect Toaster.success call
                // Call the login function from AuthContext to store user data and token
                login(data.user, data.token);

                // Redirect based on user role
                switch (data.user.role) {
                    case 'EIC_Contract':
                        navigate('/admin-dashboard');
                        break;
                    case 'CONTRACT_ADMIN':
                        navigate('/etl-eic-dashboard');
                        break;
                    case 'Contract_Cell':
                        navigate('/');
                        break;
                    case 'Section_Coordinator':
                        navigate('/');
                        break;
                    case 'Section_InCharge':
                        navigate('/incharge-dashboard');
                        break;
                    case 'Service_Engineer':
                        navigate('/');
                        break;
                    default:
                        navigate('/'); // Fallback for unknown roles
                        break;
                }
            } else {
                // Login failed
                setError(data.message || 'Login failed. Please check your credentials.');
                toast.error(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again later.');
            toast.error('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="auth-container">
            <Toaster />
            <div className="auth-card">
                <h2>ETL PGPC Contract Management System</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="btn primary">Login</button>
                </form>
                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
