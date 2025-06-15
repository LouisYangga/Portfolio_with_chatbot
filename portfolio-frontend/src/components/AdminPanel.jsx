import { useState } from 'react'
import { FiUpload, FiPlus, FiEdit2, FiTrash2, FiLogOut } from 'react-icons/fi'
import { 
  Panel,
  Section,
  Button,
  TextArea,
  FileInput,
  StatusMessage,
  ModalOverlay,
  ModalContent,
  CloseButton
} from '../styles/AdminStyles'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel = ({ token }) => {
  const [knowledgeJson, setKnowledgeJson] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleKnowledgeAdd = async () => {
    try {
      let jsonData;
      try {
        jsonData = JSON.parse(knowledgeJson);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      const response = await fetch(`${API_URL}/api/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jsonData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add knowledge');
      }

      setStatus({ type: 'success', message: 'Knowledge added successfully!' });
      setKnowledgeJson('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleKnowledgeUpdate = async () => {
    try {
      let jsonData;
      try {
        jsonData = JSON.parse(knowledgeJson);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      if (!jsonData.id) {
        throw new Error('ID is required for updating knowledge');
      }

      const response = await fetch(`${API_URL}/api/knowledge/${jsonData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jsonData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update knowledge');
      }

      setStatus({ type: 'success', message: data.message });
      setKnowledgeJson('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleKnowledgeDelete = async () => {
    try {
      let jsonData;
      try {
        jsonData = JSON.parse(knowledgeJson);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      const response = await fetch(`${API_URL}/api/knowledge`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: jsonData.id })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete knowledge');
      }

      setStatus({ type: 'success', message: data.message });
      setKnowledgeJson('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleResumeUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file first' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/resume`, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      setStatus({ type: 'success', message: 'Resume uploaded successfully!' });
      setFile(null);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  // Logout confirmation handlers
  const confirmLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload(); // Reload to apply logout
  };

  return (
    <>
      <Panel
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{ color: 'var(--lightest-slate)', margin: 0 }}>Admin Panel</h2>
          <Button 
            onClick={() => setShowLogoutConfirm(true)}
            style={{ 
              width: 'auto', 
              marginBottom: 0,
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,100,100,0.1)',
              borderColor: '#ff6b6b' 
            }}
          >
            <FiLogOut /> Logout
          </Button>
        </div>
        
        {status.message && (
          <StatusMessage $type={status.type}>
            {status.message}
          </StatusMessage>
        )}

        <Section>
          <h3>Knowledge Management</h3>
          <TextArea
            value={knowledgeJson}
            onChange={(e) => setKnowledgeJson(e.target.value)}
            placeholder="Enter knowledge JSON... (e.g. content, category, id)"
          />
          <Button onClick={handleKnowledgeAdd}>
            <FiPlus /> Add Knowledge
          </Button>
          <Button onClick={handleKnowledgeUpdate}>
            <FiEdit2 /> Update Knowledge
          </Button>
          <Button onClick={handleKnowledgeDelete}>
            <FiTrash2 /> Delete Knowledge
          </Button>
        </Section>

        <Section>
          <h3>Resume Management</h3>
          <FileInput
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <Button as="label" htmlFor="resume">
            <FiUpload /> {file ? file.name : 'Select Resume File'}
          </Button>
          <Button onClick={handleResumeUpload} disabled={!file}>
            <FiUpload /> Upload Resume
          </Button>
        </Section>
      </Panel>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <ModalContent
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '350px' }}
            >
              <CloseButton onClick={() => setShowLogoutConfirm(false)}>
                <FiLogOut size={24} />
              </CloseButton>
              
              <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>
                Confirm Logout
              </h3>
              
              <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--slate)' }}>
                Are you sure you want to logout? Any unsaved changes will be lost.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button 
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ backgroundColor: 'transparent' }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmLogout}
                  style={{ 
                    backgroundColor: 'rgba(255,100,100,0.1)',
                    borderColor: '#ff6b6b'
                  }}
                >
                  <FiLogOut /> Logout
                </Button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPanel;