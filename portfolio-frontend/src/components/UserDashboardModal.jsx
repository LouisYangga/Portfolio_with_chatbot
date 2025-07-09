import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FiX, FiEye, FiEyeOff, FiRefreshCw, FiDownload } from 'react-icons/fi'
import {
  ModalOverlay,
  DashboardModalContent,
  CloseButton,
  Form,
  Input,
  SubmitButton,
  StatusMessage,
  DashboardSection,
  SectionTitle,
  LogsContainer,
  LogItem,
  LogStep,
  LogStatus,
  LogEmail,
  EmptyLogsMessage,
  PasswordToggleButton,
  PasswordInputContainer,
  LogsHeader,
  RetrieveLogsButton
} from '../styles/DemoStyles'

const ONBOARDING_API_URL = import.meta.env.VITE_ONBOARDING_API;
const ONBOARDING_API_KEY = import.meta.env.VITE_ONBOARDING_API_KEY;
const UserDashboardModal = ({ isOpen, onClose, userEmail }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [userLogs, setUserLogs] = useState([]);

  // Reset form data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSubmitStatus({ type: '', message: '' });
      setUserLogs([]);
    }
  }, [isOpen]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSubmitStatus({
        type: 'error',
        message: 'New passwords do not match'
      });
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      setSubmitStatus({
        type: 'error',
        message: 'Password must be at least 6 characters long'
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`${ONBOARDING_API_URL}/api/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${ONBOARDING_API_KEY}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          email: userEmail
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Response text:', responseText);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Password update failed');
      }

      setSubmitStatus({
        type: 'success',
        message: data.message || 'Password updated successfully!'
      });
      
      // Clear form after successful update
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Password update failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrieveLogs = async () => {
    setIsLoadingLogs(true);
    setSubmitStatus({ type: '', message: '' });
    
          try {
        const response = await fetch(`${ONBOARDING_API_URL}/api/logs/${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${ONBOARDING_API_KEY}`
          }
        });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Response text:', responseText);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to retrieve logs');
      }

      setUserLogs(data || []);
      setSubmitStatus({
        type: 'success',
        message: `Retrieved ${data?.length || 0} logs successfully!`
      });

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to retrieve logs. Please try again.'
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleInputChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatLogDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
          <DashboardModalContent
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FiX size={24} />
            </CloseButton>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--lightest-slate)' }}>User Dashboard</h2>
            
            {submitStatus.message && (
              <StatusMessage $type={submitStatus.type}>
                {submitStatus.message}
              </StatusMessage>
            )}

            <DashboardSection>
              {/* Password Update Section */}
              <div>
                <SectionTitle>Update Password</SectionTitle>
                <Form onSubmit={handlePasswordChange}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Current Password"
                    required
                    value={passwordData.currentPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <PasswordInputContainer>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="New Password"
                      required
                      value={passwordData.newPassword}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <PasswordToggleButton
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </PasswordToggleButton>
                  </PasswordInputContainer>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </SubmitButton>
                </Form>
              </div>

              {/* Logs Section */}
              <div>
                <LogsHeader>
                  <SectionTitle>User Logs</SectionTitle>
                  <RetrieveLogsButton
                    type="button"
                    onClick={handleRetrieveLogs}
                    disabled={isLoadingLogs}
                  >
                    {isLoadingLogs ? <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FiDownload size={16} />}
                    {isLoadingLogs ? 'Loading...' : 'Retrieve Logs'}
                  </RetrieveLogsButton>
                </LogsHeader>
                
                {userLogs.length > 0 && (
                  <LogsContainer>
                    {userLogs.map((log, index) => (
                      <LogItem key={index} isLast={index === userLogs.length - 1}>
                        <LogStep>
                          {log.step || 'Unknown Step'}
                        </LogStep>
                        <LogStatus>
                          {log.status || 'Unknown Status'} • {formatLogDate(log.timestamp || log.createdAt)}
                        </LogStatus>
                        {log.email && (
                          <LogEmail>
                            {log.email}
                          </LogEmail>
                        )}
                      </LogItem>
                    ))}
                  </LogsContainer>
                )}
                
                {userLogs.length === 0 && !isLoadingLogs && (
                  <EmptyLogsMessage>
                    No logs found. Click "Retrieve Logs" to fetch your data.
                  </EmptyLogsMessage>
                )}
              </div>
            </DashboardSection>
          </DashboardModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default UserDashboardModal; 