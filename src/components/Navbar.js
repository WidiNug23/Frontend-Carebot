import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomAlert from "./CustomAlert";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState(null);
  const [alertData, setAlertData] = useState({ show: false, message: "", type: "alert", onConfirm: null });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null); // ✅ Tambahan: untuk referensi dropdown

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeMenu = () => setIsOpen(false);

  const fetchUserData = () => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedUser) {
      setUser(loggedUser);
    }
  };

  useEffect(() => {
    fetchUserData();
    const handleStorageChange = () => fetchUserData();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setVisible(currentScrollY <= 50 || currentScrollY < lastScrollY);
    setLastScrollY(currentScrollY);
  };

  const showAlert = (message, type = "alert", onConfirm = null) => {
    setAlertData({ show: true, message, type, onConfirm });
  };

  const closeAlert = () => {
    setAlertData({ ...alertData, show: false });
  };

  const handleLogout = () => {
    showAlert("Apakah Anda yakin ingin logout?", "confirm", () => {
      localStorage.removeItem("loggedInUser");
      setUser(null);
      navigate("/");
    });
  };

  const handleProtectedRoute = (e) => {
    if (!user) {
      e.preventDefault();
      showAlert("Anda harus login terlebih dahulu untuk mengakses halaman ini.", "confirm", () => navigate("/login"));
    } else {
      closeMenu();
    }
  };

  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutsideSidebar);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    }

    return () => document.removeEventListener("mousedown", handleClickOutsideSidebar);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getNutrisiPathAndTitle = () => {
    if (!user) return null;
    switch (user.kategori) {
      case "Remaja":
        return { path: "/remaja", title: "Nutrisi Remaja" };
      case "Lansia":
        return { path: "/lansia", title: "Nutrisi Lansia" };
      case "Ibu Hamil":
        return { path: "/ibu_hamil", title: "Nutrisi Ibu Hamil" };
      case "Ibu Menyusui":
        return { path: "/ibu_menyusui", title: "Nutrisi Ibu Menyusui" };
      default:
        return null;
    }
  };

  const nutrisiLink = getNutrisiPathAndTitle();

  return (
    <>
      <CustomAlert show={alertData.show} message={alertData.message} type={alertData.type} onClose={closeAlert} onConfirm={alertData.onConfirm} />

      <div className={`sidebar ${visible ? "visible" : "hidden"}`} ref={sidebarRef}>
        <Link to="/" className="carebot-link">
          <img src="/carebot-logo.png" alt="CareBot Logo" className="carebot-logo" />
        </Link>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          &#9776;
        </button>

        <ul className={`menu ${isOpen ? "active" : ""}`}>
          <li>
            <Link to="/" className="menu-link" onClick={closeMenu}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/infografis" className="menu-link" onClick={closeMenu}>
              Infografis
            </Link>
          </li>

          {/* Nutrisi section */}
          {nutrisiLink ? (
            <li>
              <Link to={nutrisiLink.path} className="menu-link" onClick={closeMenu}>
                {nutrisiLink.title}
              </Link>
            </li>
          ) : (
            <li className="dropdown" ref={dropdownRef}> {/* ✅ Tambahkan ref ke dropdown */}
              <span className="menu-link dropdown-toggle" onClick={toggleDropdown}>
                Nutrisi
              </span>
              {dropdownOpen && (
                <ul id="nutrisi-dropdown" className={`dropdown-menu ${dropdownOpen ? "active" : ""}`}>
                  <li>
                    <Link to="/remaja" className="menu-link" onClick={handleProtectedRoute}>
                      Nutrisi Remaja
                    </Link>
                  </li>
                  <li>
                    <Link to="/lansia" className="menu-link" onClick={handleProtectedRoute}>
                      Nutrisi Lansia
                    </Link>
                  </li>
                  <li>
                    <Link to="/ibu_hamil" className="menu-link" onClick={handleProtectedRoute}>
                      Nutrisi Ibu Hamil
                    </Link>
                  </li>
                  <li>
                    <Link to="/ibu_menyusui" className="menu-link" onClick={handleProtectedRoute}>
                      Nutrisi Ibu Menyusui
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          <li>
            <Link to="/kalkulator" className="menu-link" onClick={closeMenu}>
              Kalkulator
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to={`/profile/${user.id}`} className="menu-link" onClick={closeMenu}>
                  Welcome, {user.nama}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="menu-link logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="menu-link login-button" onClick={closeMenu}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;
