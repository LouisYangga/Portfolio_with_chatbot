import { FiX, FiGithub, FiLinkedin } from 'react-icons/fi'
import { MobileMenu as StyledMobileMenu } from '../styles/StyledComponents'

const sectionLinks = [
  { id: 'chatbot', label: 'AI Assistant' },
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'work', label: 'Work' },
  { id: 'demo', label: 'Demo' },
  { id: 'contact', label: 'Contact' },
];

const MobileMenu = ({ isOpen, onClose }) => {
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
              const el = document.getElementById(link.id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              onClose();
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