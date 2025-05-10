import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import { WorkSection } from '../../styles/SectionStyles'

const Work = () => {
  const projects = [
    {
      title: 'AI-Enhanced Developer Portfolio Website',
      description: 'A modern, responsive portfolio site built using React and an integrated AI assistant for interactive user engagement. The backend is powered by Node.js, enabling scalable support for chatbot functionality and content management.',
      tech: ['React', 'Node.js', 'Framer Motion', 'Styled Components', 'PineCone', 'OpenAI', 'AWS S3','MongoDB'],
      github: 'https://github.com/LouisYangga/Portfolio_with_chatbot',
      external: 'https://yourportfolio.com',
    },
    {
      title: 'Multi Label Classification',
      description: 'Refined a pre-trained RoBERTa model for multi-label classification of news articles across 8 categories, using a balanced dataset of 10,000 samples per class. Initially developed for single-label classification, the project transitioned to multi-label after identifying overlapping topic predictions during error analysis.',
      tech: ['Python', 'PyTorch', 'Hugging Face Transformer', 'Pandas', 'NumPy'],
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
    }
    
    // Add more projects as needed
  ]

  return (
    <WorkSection id="work">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="section-heading">Some Things I've Built</h2>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              className="project-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="project-top">
                <h3>{project.title}</h3>
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <FiGithub />
                    </a>
                  )}
                  {project.external && (
                    <a href={project.external} target="_blank" rel="noopener noreferrer">
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