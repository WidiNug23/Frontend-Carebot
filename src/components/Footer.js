import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Bagian kiri - Logo & Hak Cipta */}
        <div className="footer-left">
          <div className="footer-left-content">
            <img
              src="/carebot-logo.png"
              alt="CareBot Logo"
              className="footer-logo"
            />
            <p>&copy; {new Date().getFullYear()} CareBot. Penuhi Kebutuhan Nutrisimu.</p>
          </div>
        </div>

        {/* Bagian kanan - Link */}
        <div className="footer-right">
          <a href="#about-us">Tentang Kami</a>
          <a href="#contact">Kontak</a>
          <a href="#privacy-policy">Kebijakan Privasi</a>
          <a href="#terms">Syarat dan Ketentuan</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
