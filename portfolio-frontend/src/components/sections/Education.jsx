import { useState } from 'react'
import { motion } from 'framer-motion'
import { EducationSection } from '../../styles/SectionStyles'
 import styled from 'styled-components'

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

const Education = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleResumeDownload = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3000/api/resume', {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      });
      
      if (!response.ok) throw new Error('Failed to get download link');
      
      const data = await response.json();
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading resume:', error);
    } finally {
      setIsLoading(false)
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
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
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
        </div>
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