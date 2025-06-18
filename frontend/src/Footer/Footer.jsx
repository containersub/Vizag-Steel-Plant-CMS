
import {  Mail, Phone, MapPin } from "lucide-react";
import "./Footer.css";

function Footer() {
  

  return (
    <footer className="footer-container">
      {/* Embedded CSS for the Footer */}

      <div className="footer-content">
        <div className="footer-column about-us">
          <h3>About Us</h3>
          <p>
            ETL PGPC Contract Management System is dedicated to streamlining
            contract and asset maintenance for businesses, ensuring efficiency
            and compliance.
          </p>
        </div>

        <div className="footer-column quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#assets">Assets</a>
            </li>
            <li>
              <a href="#complaints">Complaints</a>
            </li>
            <li>
              <a href="#pm">Preventive Maintenance</a>
            </li>
            <li>
              <a href="#reports">Reports</a>
            </li>
          </ul>
        </div>

        <div className="footer-column legal-links">
          <h3>Legal</h3>
          <ul>
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="#terms">Terms of Service</a>
            </li>
            <li>
              <a href="#disclaimer">Disclaimer</a>
            </li>
          </ul>
        </div>

        <div className="footer-column contact-us">
          <h3>Contact Us</h3>
          <div className="contact-info">
            <p>
              <MapPin size={20} /> Visakhapatnam Steel Plant, Visakhapatnam -
              530031, Andhra Pradesh, India.
            </p>
            <p>
              <Phone size={20} /> +91 900000000
            </p>
            <p>
              <Mail size={20} /> etlcontractinfo@gmail.com
            </p>
          </div>
         
        </div>
      </div>

   
    </footer>
  );
}

export default Footer;
