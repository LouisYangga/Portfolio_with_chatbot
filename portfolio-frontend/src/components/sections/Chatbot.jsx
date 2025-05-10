import { motion } from 'framer-motion'
import Chat from '../Chat'
import styled from 'styled-components'

const ChatbotSection = styled.section`
  margin: 0 auto;
  padding: 60px 0;
  max-width: 1000px;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const ChatDescription = styled.div`
  margin-bottom: 2rem;
  max-width: 600px;

  h2 {
    margin-bottom: 1rem;
  }

  p {
    color: var(--slate);
  }
`

const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--light-navy);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
  position: relative;
`

const Chatbot = () => {
  return (
    <ChatbotSection id="chatbot">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChatDescription>
          <h2 className="section-heading">AI Assistant</h2>
          <p>Have a conversation with my AI assistant to learn more about my background, skills, and projects. Feel free to ask any questions!</p>
        </ChatDescription>
        <ChatContainer>
          <Chat />
        </ChatContainer>
      </motion.div>
    </ChatbotSection>
  )
}

export default Chatbot