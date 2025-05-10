import { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 25, 47, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

const ModalContent = styled(motion.div)`
  background: var(--light-navy);
  padding: 2rem;
  border-radius: 4px;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--slate);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--green);
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 4px;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);

  &:focus {
    outline: none;
    border-color: var(--green);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 4px;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--green);
  }
`

const SubmitButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);

  &:hover {
    background-color: rgba(100,255,218,0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! I will get back to you soon.'
      });
      
      // Clear form after successful submission
      setFormData({ name: '', email: '', message: '' });
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setSubmitStatus({ type: '', message: '' });
      }, 3000);

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FiX size={24} />
            </CloseButton>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--lightest-slate)' }}>Get in Touch</h2>
            {submitStatus.message && (
              <StatusMessage $type={submitStatus.type}>
                {submitStatus.message}
              </StatusMessage>
            )}
            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <TextArea
                name="message"
                placeholder="Your Message"
                required
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

const StatusMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
  background-color: ${props => props.$type === 'success' ? 'rgba(100,255,218,0.1)' : 'rgba(255,100,100,0.1)'};
  color: ${props => props.$type === 'success' ? 'var(--green)' : '#ff6b6b'};
  border: 1px solid ${props => props.$type === 'success' ? 'var(--green)' : '#ff6b6b'};
`;

export default ContactModal;