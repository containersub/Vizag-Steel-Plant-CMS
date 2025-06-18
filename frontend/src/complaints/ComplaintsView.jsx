import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // For making API requests, you might need to install it: npm install axios
import './ComplaintsView.css'; // Assuming you have some CSS for styling

const ComplaintsView = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserDepartment] = useState(null); // Assuming you might get this from context/auth

  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8080/ContractManagementSystem/complaints', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComplaints(response.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to fetch complaints. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []); // Empty dependency array means this runs once on component mount

  // Placeholder for status indicator class
  const getStatusIndicatorClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-200 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-200 text-yellow-800';
      case 'CLOSED':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading complaints...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">View All Complaints</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          aria-label="Close Complaints View"
        >
          Close
        </button>
      </div>
      {complaints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No complaints found.</div>
      ) : (
        <div className="table-responsive bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Complaint ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Raised By</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Raised</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className="px-5 py-5 text-sm">{complaint.id}</td>
                  <td className="px-5 py-5 text-sm">{complaint.asset_id}</td>
                  <td className="px-5 py-5 text-sm">{complaint.asset_type}</td>
                  <td className="px-5 py-5 text-sm">{complaint.location}</td>
                  <td className="px-5 py-5 text-sm">{complaint.complaint_category}</td>
                  <td className="px-5 py-5 text-sm max-w-xs truncate" title={complaint.description}>{complaint.description}</td>
                  <td className="px-5 py-5 text-sm">
                    <span
                      className={`status-indicator-com ${getStatusIndicatorClass(
                        complaint.status
                      )} px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {complaint.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">{complaint.department}</td>
                  <td className="px-5 py-5 text-sm">{complaint.raised_by_user_name}</td>
                  <td className="px-5 py-5 text-sm">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {complaint.status === "CLOSED" && complaint.closed_feedback && (
                      <span
                        className="feedback-text text-green-600 font-medium ml-2"
                        title={complaint.closed_feedback}
                      >
                        Feedback provided
                      </span>
                    )}
                    {complaint.status !== "CLOSED" && currentUserDepartment && complaint.department !== currentUserDepartment && (
                      <span className="text-gray-500 text-sm italic ml-2"></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComplaintsView;
