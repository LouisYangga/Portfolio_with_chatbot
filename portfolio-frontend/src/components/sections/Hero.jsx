import { motion } from 'framer-motion'
import { Hero as HeroSection } from '../../styles/SectionStyles'

const Hero = () => {
  return (
    <HeroSection>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Hi, my name is</h1>
        <h2>Louis Yangga.</h2>
        <h3>Software Engineer & Problem Solver.</h3>
        <p>
        I'm a passionate software engineer with a strong foundation in full-stack development, machine learning, and user-focused design.
        I enjoy turning complex ideas into scalable, clean code — from APIs to intelligent systems. Currently,
        I'm building accessible, practical tools and experimenting with AI-powered solutions and automation tools to improve digital experiences.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <a
            href="#chatbot"
            className="cta-button"
            style={{
              display: 'inline-block',
              marginTop: '50px',
              padding: '20px 28px',
              border: '1px solid var(--green)',
              borderRadius: '4px',
              color: 'var(--green)',
              fontSize: 'var(--fz-sm)',
              textDecoration: 'none',
              transition: 'all 0.25s cubic-bezier(0.645,0.045,0.355,1)',
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = 'rgba(100,255,218,0.1)'
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            Check out my Assistant!
          </a>
        </motion.div>
      </motion.div>
    </HeroSection>
  )
}

export default Hero