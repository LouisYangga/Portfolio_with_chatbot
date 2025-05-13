import { useState } from 'react'
import { motion } from 'framer-motion'
import { EducationSection } from '../../styles/SectionStyles'
import styled from 'styled-components'

const API_URL = import.meta.env.VITE_API_URL;

const ResumeButton = styled.a`
  display: inline-block;
  margin-top: 2rem;
  padding: 1rem 2rem;
  background-color: transparent;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);
  cursor: pointer;

  &:hover {
    background-color: rgba(100,255,218,0.1);
    transform: translateY(-3px);
  }
`

const ResponsiveContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    
    .tab-list {
      display: flex;
      flex-direction: row !important;
      width: 100% !important;
      overflow-x: auto;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      
      &::-webkit-scrollbar {
        height: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: var(--green);
      }
    }
    
    .tab-button {
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .tab-content {
      margin-left: 0 !important;
    }
  }
`

const Education = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleResumeDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/resume/download`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      });
      
      if (!response.ok) throw new Error('Failed to download resume');
      
      // Create a blob from the response
      const blob = await response.blob();
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LouisYangga-Resume.pdf';
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const education = [
    {
      year: '2020-2023',
      school: 'University of Wollongong, Australia',
      degree: 'Bachelor of Science in Computer Science (Honors)',
      points: [
        'Specialised in Software Engineering with a focus on backend systems and machine learning',
        'Relevant coursework: Data Structures, Algorithms, Software Engineering, Web Development',
        'Completed an Honours research project on phishing link detection using machine learning',
        'Graduated with Distinction'
      ]
    },
    {
      year: '2016-2019',
      school: 'SMA Sutomo 1 Medan, Indonesia',
      degree: 'High School',
      points: [
        'Maintained an average academic score above 80 throughout high school',
        'Participated in extracurricular web development activities',
        'Gained foundational skills in HTML, CSS, and JavaScript through school projects',
      ]
    }
  ]

  return (
    <EducationSection id="education">
      <motion.div
        className="inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="section-heading">Education</h2>
        <ResponsiveContainer>
          <div className="tab-list">
            {education.map((edu, i) => (
              <button
                key={i}
                className={`tab-button ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {edu.year}
              </button>
            ))}
          </div>
          <div className="tab-content">
            <h3>{education[activeTab].school}</h3>
            <h4>{education[activeTab].degree}</h4>
            <ul>
              {education[activeTab].points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </ResponsiveContainer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <ResumeButton
            onClick={handleResumeDownload}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Download Resume'}
          </ResumeButton>
        </motion.div>
      </motion.div>
    </EducationSection>
  )
}

export default Education