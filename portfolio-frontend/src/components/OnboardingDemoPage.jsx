import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import OnboardingDemoForm from './OnboardingDemoForm';
import OnboardingDemoLogs from './OnboardingDemoLogs';
import { io } from 'socket.io-client';

const FullWidthContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background-color:#0a192f;
`;

const Section = styled.section`
  margin: 0 auto;
  padding: 60px 20px;
  max-width: 1400px;
  scroll-margin-top: 90px;
  padding-top: 30px;
`;

const OnboardingDemoPage = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    title: '',
    email: '',
    githubUsername: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const logsEndRef = useRef(null)
  const logsSectionRef = useRef(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToLogs = () => {
    logsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])



  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLogs([]);
    addLog('$ Starting onboarding process...', 'info');
    addLog(`$ Processing: ${formData.firstName} ${formData.lastName}`, 'info');
    
    // Scroll to logs section when process starts
    setTimeout(() => {
      scrollToLogs();
    }, 100);

    // Prepare payload
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      title: formData.title,
      department: formData.department,
      email: formData.email,
      githubusername: formData.githubUsername,
    };

    try {
      // Call the onboarding API
      const apiKey = import.meta.env.VITE_ONBOARDING_API_KEY;
      const response = await fetch('https://onboardingautomation.onrender.com/api/start-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`$ Failed to start onboarding process: ${response.status} ${response.statusText}`, 'error');
        addLog(`$ Response: ${errorText}`, 'error');
        setIsSubmitting(false);
        return;
      }
      
      // Parse the response to get the temporary password
      const responseData = await response.json();
      let tempPassword = '';
      if (responseData.password) {
        tempPassword = responseData.password;
      }
      
      addLog('Onboarding process started. Listening for updates...', 'success');

      // Connect to Socket.IO server
      const socket = io('https://onboardingautomation.onrender.com');
      
      socket.on('connect', () => {
        setIsConnected(true);
        addLog('$ Connected to server', 'info');
      });

      socket.on('log', (data) => {
        try {
          // Expecting { email, step, status, timestamp, _id, __v }
          if (data.step && data.status) {
            addLog(`> Email: ${data.email} | Step: ${data.step} | Status: ${data.status}`, data.status === 'success' ? 'success' : 'process');
          }
          if (data.status === 'finished') {
            addLog('$ Onboarding process finished!', 'success');
            addLog(`$ User created successfully with temporary password: ${tempPassword}`, 'success');
            setIsSubmitting(false);
            socket.disconnect();
            // Clear the form when finished
            setFormData({
              firstName: '',
              lastName: '',
              department: '',
              title: '',
              email: '',
              githubUsername: ''
            });
          }
        } catch (err) {
          addLog('$ Error parsing log data from server', 'error');
          setIsSubmitting(false);
          socket.disconnect();
        }
      });

      socket.on('error', (err) => {
        addLog('$ Socket.IO error occurred', 'error');
        setIsSubmitting(false);
        socket.disconnect();
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        // log disconnect
      });
    } catch (err) {
      addLog('$ Error starting onboarding process', 'error');
      setIsSubmitting(false);
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '$'
      case 'error': return '$'
      case 'process': return '>'
      default: return '$'
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      case 'process': return 'text-yellow-500'
      default: return 'text-blue-500'
    }
  }

  return (
    <FullWidthContainer>
      <Section id="onboarding-demo">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div style={{ width: 44, height: 44 }}></div>
              <div>
                <h1 className="text-3xl font-bold text-navy-900">Onboarding Automation Demo</h1>
                <p className="text-gray-500">Simulate the employee onboarding process</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                style={{
                  color: isConnected ? '#22c55e' : '#ef4444',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {isConnected ? 'Processing . . .' : 'Waiting for input . . .'}
              </span>
            </div>
          </div>

          <div className="flex flex-row justify-between gap-8" style={{ minHeight: '600px', display: 'flex', flexDirection: 'row' }}>
            <div className="w-1/2" style={{ flex: '0 0 50%' }}>
              <OnboardingDemoForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
            <div className="w-1/2" style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column' }} ref={logsSectionRef}>
              <OnboardingDemoLogs
                logs={logs}
                logsEndRef={logsEndRef}
                getLogColor={getLogColor}
              />
            </div>
          </div>
        </div>
      </Section>
    </FullWidthContainer>
  )
}

export default OnboardingDemoPage 