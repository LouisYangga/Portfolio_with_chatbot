import { motion } from 'framer-motion'
import { useState } from 'react'
import { ContactSection } from '../../styles/SectionStyles'
import ContactModal from '../ContactModal'

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <ContactSection id="contact">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="contact-title">What's Next?</h2>
        <h2>Get In Touch</h2>
        <p>
          I'm currently looking for new opportunities, and my inbox is always open.
          Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        <a
          className="email-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
        >
          Say Hello
        </a>
      </motion.div>
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </ContactSection>
  )
}

export default Contact