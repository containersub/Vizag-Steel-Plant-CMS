import Footer from "./Footer/Footer";
import Navbar from "./Home/Navbar";



const Layout = ({ children }) => {
  // Destructure children directly
  return (
    <div>
     <Navbar/>
      <div className="">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
