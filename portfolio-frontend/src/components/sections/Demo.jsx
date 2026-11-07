import { useState } from 'react'
import { motion } from 'framer-motion'
import { reveal } from '../../utils/motion'
import { FiGithub, FiExternalLink, FiPlay, FiCode } from 'react-icons/fi'
import { DemoSection } from '../../styles/SectionStyles'
import { useNavigate } from 'react-router-dom'

const Demo = ({ onPageChange }) => {
  const [activeDemo, setActiveDemo] = useState(0)
  const navigate = useNavigate()

  const demos = [
    {
      title: 'AI Chatbot Assistant',
      description: 'Interactive AI-powered chatbot that can answer questions about my background, skills, and projects. Built with OpenAI API and integrated with Pinecone for knowledge retrieval.',
      tech: ['React', 'Node.js', 'OpenAI API', 'Pinecone', 'Styled Components'],
      github: 'https://github.com/LouisYangga/Portfolio_with_chatbot',
      live: 'https://louisyangga.com/#chatbot',
      demoUrl: '/#chatbot',
      icon: <FiPlay />
    },
    {
      title: 'Onboarding Automation',
      description: 'Onboarding automation for new employees. It creates the user in the database, then sends a welcome email, a Google Calendar invitation and, if provided, a GitHub organization invite. The form collects the new employee\'s name, email, and department. The project uses Node.js, MongoDB, Express.js, and n8n.',
      tech: ['Node.js', 'MongoDB', 'Express.js', 'n8n'],
      github: 'https://github.com/LouisYangga/OnboardingAutomation',
      demoUrl: 'onboarding',
      icon: <FiPlay />
    },
  ]

  const handleDemoClick = (demoUrl) => {  
    if (demoUrl === '/#chatbot') {
      // Scroll to chatbot section
      const chatbotSection = document.getElementById('chatbot')
      if (chatbotSection) {
        chatbotSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (demoUrl === 'onboarding') {
      // Open onboarding demo page
      onPageChange('onboarding-demo')
    } else if (demoUrl !== '#') {
      // For external demos
      console.log('Demo URL:', demoUrl)
    }
  }

  return (
    <DemoSection id="demo">
      <motion.div
        {...reveal()}
      >
        <h2 className="section-heading">Interactive Demos</h2>
        <p className="section-description">
          Experience my projects firsthand through these interactive demonstrations
        </p>
        
        <div className="demos-grid">
          {demos.map((demo, i) => (
            <motion.div
              key={i}
              className="demo-card"
              {...reveal(Math.min(i, 3) * 0.05)}
            >
              <div className="demo-header">
                <div className="demo-icon">
                  {demo.icon}
                </div>
                <div className="demo-links">
                  {demo.github && (
                    <a href={demo.github} target="_blank" rel="noopener noreferrer" title="View Code" aria-label={`${demo.title} source code on GitHub`}>
                      <FiGithub />
                    </a>
                  )}
                  {demo.live && (
                    <a href={demo.live} target="_blank" rel="noopener noreferrer" title="Live Demo" aria-label={`${demo.title} live demo`}>
                      <FiExternalLink />
                    </a>
                  )}
                </div>
              </div>
              
              <h3 className="demo-title">{demo.title}</h3>
              <p className="demo-description">{demo.description}</p>
              
              <div className="demo-tech-list">
                {demo.tech.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
              
              {demo.demoUrl === 'onboarding' ? (
                <button
                  className="demo-button"
                  onClick={() => navigate('/onboarding-demo')}
                  style={{ textAlign: 'center' }}
                >
                  Launch Demo
                </button>
              ) : (
                <button 
                  className="demo-button"
                  onClick={() => handleDemoClick(demo.demoUrl)}
                  disabled={demo.demoUrl === '#'}
                >
                  {demo.demoUrl === '/#chatbot' ? 'Try Chatbot' : 'Launch Demo'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
      
    </DemoSection>
  )
}

export default Demo 