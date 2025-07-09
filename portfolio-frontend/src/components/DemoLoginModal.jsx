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
} from '../styles/DemoStyles'
import UserDashboardModal from './UserDashboardModal'

const ONBOARDING_API_URL = import.meta.env.VITE_ONBOARDING_API;

const DemoLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Reset form data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '' });
      setSubmitStatus({ type: '', message: '' });
      setShowDashboard(false);
      setUserEmail('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
      // Use a different API endpoint for demo login
      const response = await fetch(`${ONBOARDING_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ONBOARDING_API_KEY
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      setUserEmail(formData.email);
      onLogin(data);
      
      setShowDashboard(true);
      setSubmitStatus({ type: '', message: '' });

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Demo login failed. Please try again.'
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
    <>
      <AnimatePresence>
        {isOpen && !showDashboard && (
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
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--lightest-slate)' }}>Demo Login</h2>
              {submitStatus.message && (
                <StatusMessage $type={submitStatus.type}>
                  {submitStatus.message}
                </StatusMessage>
              )}
              <Form onSubmit={handleSubmit}>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={formData.email}
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

      <UserDashboardModal
        isOpen={showDashboard}
        onClose={() => {
          setShowDashboard(false);
          onClose();
        }}
        userEmail={userEmail}
      />
    </>
  );
};

export default DemoLoginModal; 