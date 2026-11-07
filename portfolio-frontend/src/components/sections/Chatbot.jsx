import { useState } from 'react'
import Chat from '../Chat'
import { ChatbotSection, ChatDescription, ChatContainer, ChatButton } from '../../styles/ChatbotStyles'

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(true)

  return (
    <ChatbotSection id="chatbot">
      <div style={{ width: '100%' }}>
        <ChatDescription>
          <h2 className="section-heading">AI Assistant</h2>
          <p>Have a conversation with my AI assistant to learn more about my background, skills, and projects. Feel free to ask any questions!</p>
        </ChatDescription>
        <ChatContainer>
          <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          {!isChatOpen && (
            <ChatButton onClick={() => setIsChatOpen(true)}>
              Open Chat
            </ChatButton>
          )}
        </ChatContainer>
      </div>
    </ChatbotSection>
  )
}

export default Chatbot