import { useState } from "react";
import { User, Mail, Phone, Briefcase, Building, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

function Registration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNo: "",
    role: "",
    department: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setMessage({ text: "", type: "" });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/ContractManagementSystem/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            contactNo: formData.contactNo,
            role: formData.role,
            department: formData.department,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage({
          text: result.message || "Registration successful!",
          type: "success",
        });

        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          contactNo: "",
          role: "",
          department: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage({
          text: result.message || "Registration failed",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Error connecting to server!",
        type: "error",
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Sign Up
        </h2>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded-md text-sm text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="inputfield"
            />
          </div>

          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="contactNo"
              placeholder="Contact Number"
              value={formData.contactNo}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="relative">
            <Briefcase
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full2 pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="" disabled>
                Select Role
              </option>
              {/* Updated role values to match your categories more explicitly */}
              <option value="EIC_Contract">ETL Dept EIC of the Contract</option>
              <option value="Contract_Cell">ETL Dept Contract Cell</option>
              <option value="Section_Coordinator">Zone wise Electrical Section coordinators to Verify PM</option>
              <option value="Section_InCharge">Zone wise Electrical Section In charges to Approve PM</option>
              <option value="Service_Engineer">Contract Service Engineers</option>
              <option value="Others">Others</option>
            </select>
            
          </div>

          <div className="relative">
            <Building
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full2 pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="" disabled>
                Select Department
              </option>
              <option value="BF">BF</option>
              <option value="COCCP">COCCP</option>
              <option value="CRMP">CRMP</option>
              <option value="EMD">EMD</option>
              <option value="ES&F">ES&F</option>
              <option value="LMMM">LMMM</option>
              <option value="MMSM">MMSM</option>
              <option value="RMHP">RMHP</option>
              <option value="RS&RS">RS&RS</option>
              <option value="SBM">SBM</option>
              <option value="SMS">SMS</option>
              <option value="SMS2">SMS2</option>
              <option value="SP">SP</option>
              <option value="IT">IT</option>
              <option value="STM">STM</option>
              <option value="HR">HR</option>
              <option value="WMD">WMD</option>
              <option value="WRM">WRM</option>
              <option value="WRM2">WRM2</option>
              <option value="ETL">ETL</option>
              <option value="Others">Others</option>
            </select>
            
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-semibold text-lg shadow-md"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          <div className="text-center mt-4">
            <a href="/login" className="text-blue-600 hover:underline text-sm">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
