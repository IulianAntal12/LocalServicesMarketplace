import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, Menu, X } from "lucide-react";
import { Button } from "../common";
import { useAuth } from "../../context";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { isAuthenticated, user, logout, isProvider } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Wrench size={22} color="white" />
          </div>
          <span className={styles.logoText}>LocalPro</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link to="/search" className={styles.navLink}>
            Browse Services
          </Link>
          <Link to="/how-it-works" className={styles.navLink}>
            How It Works
          </Link>
          <Link to="/become-provider" className={styles.navLink}>
            For Providers
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <>
              <Link
                to={isProvider ? "/dashboard/provider" : "/dashboard"}
                className={styles.navLink}
              >
                Dashboard
              </Link>
              <span className={styles.userName}>
                Hi, {user?.fullName?.split(" ")[0]}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link
            to="/search"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Browse Services
          </Link>
          <Link
            to="/how-it-works"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            to="/become-provider"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            For Providers
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={isProvider ? "/dashboard/provider" : "/dashboard"}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button className={styles.mobileLogout} onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  navigate("/register");
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
