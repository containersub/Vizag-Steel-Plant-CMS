import React from 'react'
import { useAuth } from '../AuthContext'

const GenericDashboard = () => {
    let{logout,loading}=useAuth();
  return (
    <div>GenericDashboard
        <h1>Welcome to the Generic Dashboard</h1>
        <p>This is a placeholder for the generic dashboard content.</p>
        <button onClick={logout}>Logout</button>    
        <p>{loading ? "Loading..." : "You are logged in."}</p>
    </div>
  )
}

export default GenericDashboard