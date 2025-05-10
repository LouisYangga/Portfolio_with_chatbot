import { FiX } from 'react-icons/fi'
import { MobileMenu as StyledMobileMenu } from '../styles/StyledComponents'

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
        <a href="#chatbot" onClick={onClose}>AI Assistant</a>
        <a href="#about" onClick={onClose}>About</a>
        <a href="#education" onClick={onClose}>Education</a>
        <a href="#work" onClick={onClose}>Work</a>
        <a href="#contact" onClick={onClose}>Contact</a>
      </nav>
    </StyledMobileMenu>
  )
}

export default MobileMenu