
import { useAuth } from "../AuthContext";
import "./navbar.css";
import { FaUserCircle } from "react-icons/fa";




const Navbar = () => {

  let{user,logout}=useAuth();
  return (
    <div>
      <div className="navbar-wrapper">
        <div className="nmain">
          <h2>ETL PGPC Contract Management System</h2>
          <div className="user-info">
            <a href="/login" className="user-info-login">Login Here...</a>
            <a href="/profile">
              <p>Welcome, {user?.name} !
              <span>
                  <FaUserCircle />
              </span>
            </p>
            </a>
          </div>
        </div>
        {user &&<nav className="nnav">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            {user?.role === "EIC_Contract" &&  
              <li>
                <a href="/admin-dashboard">Dashboard</a>
              </li>
            }
             
             
             {user?.role === "Service_Engineer" &&  
              <li>
                <a href="/engineer-dashboard">Dashboard</a>
              </li>
            }
            {
              user?.role === "Section_Coordinator" &&
              <li>
                <a href="/coordinator-dashboard">Dashboard</a>
              </li>
            }
            {user?.role === "Section_InCharge" &&
            <li>
              <a href="/incharge-dashboard">Dashboard</a>  
            </li>}
            <li>
              <a href="/assets">Assets</a>
            </li>
            <li>
              <a href="/complaints">Complaints</a>
            </li>
            {
              (user?.role === "Service_Engineer" || user?.role === "EIC_Contract" || user?.role === "Section_Coordinator" || user?.role === "Section_InCharge") &&
              <li>
                <a href="/preventive-maintenance">Preventive Maintenance</a>
              </li>
            }
            
            {user?.role ==="EIC_Contract" &&
              <li>
              <a href="/reports">Reports</a>
              </li>
            }
            
            <li>
              <a href=""onClick={logout} >Logout</a>
            </li>
          </ul>
        </nav>}
      </div>
    </div>
  );
};

export default Navbar;