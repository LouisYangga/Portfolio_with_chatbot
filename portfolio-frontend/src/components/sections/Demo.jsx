import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink, FiPlay, FiCode } from 'react-icons/fi'
import { DemoSection } from '../../styles/SectionStyles'

const Demo = () => {
  const [activeDemo, setActiveDemo] = useState(0)

  const demos = [
    {
      title: 'AI Chatbot Assistant',
      description: 'Interactive AI-powered chatbot that can answer questions about my background, skills, and projects. Built with OpenAI API and integrated with PineCone for knowledge retrieval.',
      tech: ['React', 'Node.js', 'OpenAI API', 'PineCone', 'Styled Components'],
      github: 'https://github.com/LouisYangga/Portfolio_with_chatbot',
      live: 'https://louisyangga.com',
      demoUrl: '#chatbot',
      icon: <FiPlay />
    },
    {
      title: 'Onboarding Automation',
      description: 'Onboarding automation for new employees. This project automates the onboarding process for new employees by  create user into database, sending them welcome email, google calendar invitation and github organization invite if provided. The form collects the new employee\'s name, email, and department. The project uses Node.js, MongoDB, Express.js, and n8n.',
      tech: ['Node.js', 'MongoDB', 'Express.js', 'n8n'],
      github: 'https://github.com/LouisYangga/OnboardingAutomation',
      demoUrl: '#',
      icon: <FiPlay />
    },
  ]

  const handleDemoClick = (demoUrl) => {  
    if (demoUrl === '#chatbot') {
      // Scroll to chatbot section
      const chatbotSection = document.getElementById('chatbot')
      if (chatbotSection) {
        chatbotSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (demoUrl !== '#') {
      // For external demos, you can add logic here
      console.log('Demo URL:', demoUrl)
    }
  }

  return (
    <DemoSection id="demo">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="demo-header">
                <div className="demo-icon">
                  {demo.icon}
                </div>
                <div className="demo-links">
                  {demo.github && (
                    <a href={demo.github} target="_blank" rel="noopener noreferrer" title="View Code">
                      <FiGithub />
                    </a>
                  )}
                  {demo.live && (
                    <a href={demo.live} target="_blank" rel="noopener noreferrer" title="Live Demo">
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
              
              <button 
                className="demo-button"
                onClick={() => handleDemoClick(demo.demoUrl)}
                disabled={demo.demoUrl === '#'}
              >
                {demo.demoUrl === '#chatbot' ? 'Try Chatbot' : 'Launch Demo'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DemoSection>
  )
}

export default Demo 