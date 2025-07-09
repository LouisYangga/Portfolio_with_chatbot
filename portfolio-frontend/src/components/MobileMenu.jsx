import { FiX, FiGithub, FiLinkedin } from 'react-icons/fi'
import { MobileMenu as StyledMobileMenu } from '../styles/StyledComponents'
import { useLocation, useNavigate } from 'react-router-dom';

const sectionLinks = [
  { id: 'chatbot', label: 'AI Assistant' },
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'work', label: 'Work' },
  { id: 'demo', label: 'Demo(s)' },
  { id: 'contact', label: 'Contact' },
];

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = (id) => {
    if (location.pathname !== '/') {
      // Go to home with hash, let ScrollToHash handle the scroll
      navigate(`/#${id}`);
      onClose();
    } else {
      // Already on home, do smooth scroll
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      onClose();
    }
  };

  return (
    <StyledMobileMenu
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <FiX />
      </button>
      <nav>
        {sectionLinks.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={e => {
              e.preventDefault();
              handleMenuClick(link.id);
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="mobile-social-links">
        <a href="https://github.com/LouisYangga" target="_blank" rel="noopener noreferrer">
          <FiGithub />
        </a>
        <a href="https://linkedin.com/in/louis-yangga" target="_blank" rel="noopener noreferrer">
          <FiLinkedin />
        </a>
      </div>
    </StyledMobileMenu>
  )
}

export default MobileMenu