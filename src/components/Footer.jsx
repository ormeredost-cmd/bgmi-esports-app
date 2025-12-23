// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="footer-root">
      <span>© {new Date().getFullYear()} BGMI Esports Hub</span>
      <span className="footer-subtext">Unofficial fan-made tournament platform</span>
    </footer>
  );
};

export default Footer;
