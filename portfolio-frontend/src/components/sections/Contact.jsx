import { motion } from 'framer-motion'
import { reveal } from '../../utils/motion'
import { useState } from 'react'
import { ContactSection } from '../../styles/SectionStyles'
import ContactModal from '../ContactModal'

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <ContactSection id="contact">
      <motion.div
        {...reveal()}
      >
        <h2 className="contact-title">What's Next?</h2>
        <h2>Get In Touch</h2>
        <p>
          I'm currently looking for new opportunities, and my inbox is always open.
          Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        <button
          type="button"
          className="email-link"
          onClick={() => setIsModalOpen(true)}
        >
          Say Hello
        </button>
      </motion.div>
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </ContactSection>
  )
}

export default Contact