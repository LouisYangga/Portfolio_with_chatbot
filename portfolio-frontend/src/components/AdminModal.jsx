import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  Form,
  Input,
  SubmitButton,
  StatusMessage
} from '../styles/AdminStyles'

const AdminModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Reset form data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ username: '', password: '' });
      setSubmitStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      onLogin(data.token);
      
      setSubmitStatus({
        type: 'success',
        message: 'Login successful!'
      });
      
      setTimeout(() => {
        onClose();
        setSubmitStatus({ type: '', message: '' });
      }, 1500);

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Login failed. Please try again.'
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
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--lightest-slate)' }}>Admin Login</h2>
            {submitStatus.message && (
              <StatusMessage $type={submitStatus.type}>
                {submitStatus.message}
              </StatusMessage>
            )}
            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;