import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, Shield } from "lucide-react";
import { useAuth } from "../../context";
import { Button } from "../common";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { isAuthenticated, user, logout, isProvider, isCustomer, isAdmin } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/dashboard/admin";
    if (isProvider) return "/dashboard/provider";
    if (isCustomer) return "/dashboard/customer";
    return "/dashboard";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>LocalPro</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link
            to="/search"
            className={`${styles.navLink} ${isActive("/search") ? styles.active : ""}`}
          >
            <Search size={18} />
            Find Services
          </Link>
          <Link
            to="/how-it-works"
            className={`${styles.navLink} ${isActive("/how-it-works") ? styles.active : ""}`}
          >
            How It Works
          </Link>
          {!isProvider && (
            <Link
              to="/become-provider"
              className={`${styles.navLink} ${isActive("/become-provider") ? styles.active : ""}`}
            >
              Become a Provider
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className={styles.desktopAuth}>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/dashboard/admin" className={styles.adminBadge}>
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <Link to={getDashboardLink()} className={styles.dashboardLink}>
                Dashboard
              </Link>
              <div className={styles.userMenu}>
                <span className={styles.userName}>
                  {user?.fullName?.split(" ")[0] || "User"}
                </span>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => navigate("/register")}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
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
            Find Services
          </Link>
          <Link
            to="/how-it-works"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          {!isProvider && (
            <Link
              to="/become-provider"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Become a Provider
            </Link>
          )}

          <div className={styles.mobileDivider} />

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/dashboard/admin"
                  className={`${styles.mobileNavLink} ${styles.adminLink}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield size={18} />
                  Admin Dashboard
                </Link>
              )}
              <Link
                to={getDashboardLink()}
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
