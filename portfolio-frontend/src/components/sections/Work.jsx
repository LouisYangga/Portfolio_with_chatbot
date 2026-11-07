import { motion } from 'framer-motion'
import { reveal } from '../../utils/motion'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import { WorkSection } from '../../styles/SectionStyles'

const Work = () => {
  const projects = [
    {
      title: 'AI-Enhanced Developer Portfolio Website',
      description: 'A modern, responsive portfolio site built using React and an integrated AI assistant for interactive user engagement. The backend is powered by Node.js, enabling scalable support for chatbot functionality and content management.',
      tech: ['React', 'Node.js', 'Framer Motion', 'Styled Components', 'Pinecone', 'OpenAI', 'AWS S3','MongoDB'],
      github: 'https://github.com/LouisYangga/Portfolio_with_chatbot',
      external: '#chatbot',
    },
    {
      title: 'Onboarding Automation',
      description: 'Onboarding automation simulation for new employees. The system is built with Node.js, MongoDB, Express.js, and n8n. It creates the user in the database, then sends a welcome email, a Google Calendar invitation and, if provided, a GitHub organization invite. The form collects the new employee\'s name, email, and department.',
      tech: ['Node.js', 'MongoDB', 'Express.js', 'n8n'],
      github: 'https://github.com/LouisYangga/OnboardingAutomation',
      external: '#demo',
    },
    {
      title: 'Multi-Label News Classification',
      description: 'Refined a pre-trained RoBERTa model for multi-label classification of news articles across 8 categories, using a balanced dataset of 10,000 samples per class. Initially developed for single-label classification, the project transitioned to multi-label after identifying overlapping topic predictions during error analysis.',
      tech: ['Python', 'PyTorch', 'Hugging Face Transformers', 'Pandas', 'NumPy'],
      github: 'https://github.com/LouisYangga/multi_label_news_classifier',
    },
    {
      title: 'Insurance System APIs',
      description: 'A backend-only insurance management system built with Java, Spring Boot, and PostgreSQL. Designed with a clean architecture to manage core insurance entities such as companies, policies, and users via RESTful APIs. Applied DTOs and Service Layer abstraction to separate concerns and ensure modular design.',
      tech: ['Java 17', 'Spring Boot', 'PostgreSQL', 'Spring Data JPA', 'Lombok'],
      github: 'https://github.com/LouisYangga/InsuranceSystem-v1.1',
    },
    {
      title: 'Institution Management System',
      description: 'A modular education platform backend built with Node.js and microservices architecture. Features independent services for admissions, user management, enrollment, and academic advising. Uses Docker for containerization, MongoDB for data persistence, and RESTful APIs with event-driven communication between services.',
      tech: ['Node.js', 'Express.js', 'Docker', 'MongoDB', 'Microservices', 'Mongoose'],
      github: 'https://github.com/LouisYangga/Microservices',
    },
    {
      title: 'Illawarra Cleaning Services Booking System',
      description: 'A booking system for Illawarra Cleaning Services with Microservices architecture. The system allows users to book cleaning services and view the status of their bookings. The system is built with Spring Boot, Spring Data JPA, AMQP, Docker, and PostgreSQL.',
      tech: ['Spring Boot', 'Spring Data JPA', 'AMQP', 'Docker', 'PostgreSQL'],
      github: 'https://github.com/LouisYangga/IllawarraCleaning_backend',
    },
  ]

  return (
    <WorkSection id="work">
      <motion.div
        {...reveal()}
      >
        <h2 className="section-heading">Some Things I've Built</h2>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              className="project-card"
              {...reveal(Math.min(i, 3) * 0.05)}
            >
              <div className="project-top">
                <h3>{project.title}</h3>
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source code on GitHub`}>
                      <FiGithub />
                    </a>
                  )}
                  {project.external && (
                    <a href={project.external} aria-label={`${project.title} live demo`} target={project.external.startsWith('#') ? '_self' : '_blank'} rel={project.external.startsWith('#') ? '' : 'noopener noreferrer'}>
                      <FiExternalLink />
                    </a>
                  )}
                </div>
              </div>
              <p>{project.description}</p>
              <ul className="project-tech-list">
                {project.tech.map((tech, i) => (
                  <li key={i}>{tech}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </WorkSection>
  )
}

export default Work