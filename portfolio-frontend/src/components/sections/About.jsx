import { motion } from 'framer-motion'
import { AboutSection } from '../../styles/SectionStyles'

const About = () => {
  const skills = [
    'JavaScript (ES6+)',
    'React',
    'Node.js & Express',
    'Java & Spring Boot',
    'C++',
    'MongoDB & PostgreSQL',
    'Git & Docker',
    'AWS',
    'n8n',
    'RABBITMQ',
    'OpenAI API',
    'Pinecone'
  ]

  return (
    <AboutSection id="about">
      <motion.div
        className="inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="about-text">
          <h2 className="section-heading">About Me</h2>
          <div>
          <p>
            Hello! My name is Louis Yangga, and I enjoy building software that solves real-world problems. 
            My passion for development began during my university years, where I explored the intersection 
            of backend systems and machine learning through academic research and personal projects.
          </p>

          <p>
            Since then, I’ve worked on a range of applications — from full-stack web platforms and APIs to 
            research-driven AI tools. I recently completed my Honours year in Computer Science, where I 
            developed a machine learning model for phishing link detection and fine-tuned a RoBERTa-based text classifier for multi-label news categorization (Personal Project).
          </p>

          <p>
            I’m currently focused on developing scalable backend services, experimenting with ML workflows, 
            and contributing to accessible, user-first digital products.
          </p>

          <p>
            Here are a few technologies I’ve been working with recently:
          </p>

          </div>
          <ul className="skills-list">
            {skills.map((skill, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {skill}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="about-image">
          {/* You can add your image here */}
        </div>
      </motion.div>
    </AboutSection>
  )
}

export default About