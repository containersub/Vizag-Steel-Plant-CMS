// HomePage.jsx
import "./HomePage.css";
import {
  CheckCircle,
  Shield,
  TrendingUp,
  Users,
  Settings,
  Briefcase,
  FileText,
  BarChart2,
  ArrowRight, // Added for CTA button
  Star, // For testimonials
  Lightbulb, // New icon for a benefit
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "../Footer/Footer";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // For animations

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="homepage-wrapper">
      <Navbar />
      <div className="home-page-container">
        {/* Hero Section */}
        <section className="hero-section">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 className="hero-title" variants={itemVariants}>
              Streamline Your Contract & Assets Management
            </motion.h1>
            <motion.p className="hero-subtitle" variants={itemVariants}>
              Efficiently manage contracts, track assets, and ensure timely
              preventive maintenance with our intuitive system.
            </motion.p>
            <motion.div className="hero-buttons" variants={itemVariants}>
              <button className="btn primary large">
                Get Started <ArrowRight size={20} />
              </button>
              <button className="btn secondary large">Learn More</button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            Key Features
          </motion.h2>
          <motion.div
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.div className="feature-card" variants={itemVariants}>
              <CheckCircle size={48} className="feature-icon" />
              <h3>Automated PM Scheduling</h3>
              <p>
                Never miss a maintenance schedule. Our system automates
                preventive maintenance planning and alerts.
              </p>
            </motion.div>
            <motion.div className="feature-card" variants={itemVariants}>
              <Shield size={48} className="feature-icon" />
              <h3>Robust Contract Tracking</h3>
              <p>
                Keep all your contract details organized, secure, and easily
                accessible from a centralized dashboard.
              </p>
            </motion.div>
            <motion.div className="feature-card" variants={itemVariants}>
              <TrendingUp size={48} className="feature-icon" />
              <h3>Performance Reporting</h3>
              <p>
                Gain insights into asset performance, complaint trends, and
                maintenance efficiency with detailed reports.
              </p>
            </motion.div>
            <motion.div className="feature-card" variants={itemVariants}>
              <Users size={48} className="feature-icon" />
              <h3>Role-Based Access Control</h3>
              <p>
                Ensure data security and proper workflows with granular
                permissions for different user roles.
              </p>
            </motion.div>
            <motion.div className="feature-card" variants={itemVariants}>
              <Settings size={48} className="feature-icon" />
              <h3>Customizable Workflows</h3>
              <p>
                Adapt the system to your unique operational needs with flexible
                and customizable workflows.
              </p>
            </motion.div>
            <motion.div className="feature-card" variants={itemVariants}>
              <Briefcase size={48} className="feature-icon" />
              <h3>Comprehensive Asset Register</h3>
              <p>
                Maintain a complete and up-to-date inventory of all your assets,
                linked directly to contracts and PMs.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            Benefits for Your Organization
          </motion.h2>
          <motion.div
            className="benefits-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.div className="benefit-item" variants={itemVariants}>
              <FileText size={36} className="benefit-icon" />
              <h4>Enhanced Compliance</h4>
              <p>
                Ensure all contracts and maintenance activities adhere to
                regulatory standards.
              </p>
            </motion.div>
            <motion.div className="benefit-item" variants={itemVariants}>
              <BarChart2 size={36} className="benefit-icon" />
              <h4>Improved Efficiency</h4>
              <p>
                Automate tedious tasks, reduce manual errors, and free up your
                team for critical work.
              </p>
            </motion.div>
            <motion.div className="benefit-item" variants={itemVariants}>
              <TrendingUp size={36} className="benefit-icon" />
              <h4>Cost Savings</h4>
              <p>
                Minimize unexpected breakdowns and extend asset lifespan through
                proactive maintenance.
              </p>
            </motion.div>
            <motion.div className="benefit-item" variants={itemVariants}>
              <Lightbulb size={36} className="benefit-icon" />
              <h4>Better Decision Making</h4>
              <p>
                Leverage data-driven insights to make informed decisions about
                your assets and operations.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Testimonials Section (New) */}
        <section className="testimonials-section">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            What Our Clients Say
          </motion.h2>
          <motion.div
            className="testimonials-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.div className="testimonial-card" variants={itemVariants}>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#ffc107" strokeWidth={0} />
                ))}
              </div>
              <p className="testimonial-text">
                "This system has revolutionized how we manage our contracts and
                assets. The automation features are a game-changer!"
              </p>
              <p className="testimonial-author">- Jane Doe, Operations Manager</p>
            </motion.div>
            <motion.div className="testimonial-card" variants={itemVariants}>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="#ffc107" strokeWidth={0} />
                ))}
              </div>
              <p className="testimonial-text">
                "The reporting features provide invaluable insights. We've seen
                a significant improvement in our maintenance efficiency."
              </p>
              <p className="testimonial-author">- John Smith, Facilities Head</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="cta-title">Ready to Transform Your Operations?</h2>
            <p className="cta-subtitle">
              Join numerous organizations benefiting from optimized contract and
              asset management.
            </p>
            <button className="btn primary large">
              Request a Demo <ArrowRight size={20} />
            </button>
          </motion.div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;