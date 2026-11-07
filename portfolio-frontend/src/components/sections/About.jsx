import { motion } from 'framer-motion'
import { reveal } from '../../utils/motion'
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
    'RabbitMQ',
    'OpenAI API',
    'Pinecone'
  ]

  return (
    <AboutSection id="about">
      <motion.div
        className="inner"
        {...reveal()}
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
            and contributing to accessible, user-first digital products. I'm also sharpening my skills in System Development
            and Automation.
          </p>

          <p>
            Here are a few technologies I’ve been working with recently:
          </p>

          </div>
          <ul className="skills-list">
            {skills.map((skill, i) => (
              <motion.li 
                key={i}
                {...reveal(Math.min(i, 6) * 0.03)}
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