import { useState, useEffect } from 'react'
import { FiSend, FiRefreshCw } from 'react-icons/fi'
import {
  ChatMessages,
  Message,
  ChatInput,
  LoadingDots,
  RetryButton
} from '../styles/ChatStyles'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: "Hi! I'm Louis's AI assistant. I can help you learn more about Louis's experience, skills, and projects. What would you like to know?",
        isUser: false
      }])
    }
    // Set initial load to false after first render
    setIsInitialLoad(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userInput = inputMessage.trim()
    setInputMessage('')
    setError(null)
    setIsLoading(true)

    setMessages(prev => [...prev, { text: userInput, isUser: true }])

    try {
      const response = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({ question: userInput })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { text: data.answer, isUser: false }])
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    if (!messages.length || isLoading) return
    
    const lastUserMessage = [...messages].reverse().find(m => m.isUser)
    if (!lastUserMessage) return

    setMessages(prev => prev.filter(m => m.text !== error))
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({ question: lastUserMessage.text })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { text: data.answer, isUser: false }])
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <ChatMessages>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.isUser}>
            <div className="message-content">
              {message.text}
            </div>
          </Message>
        ))}
        {isLoading && (
          <Message isUser={false}>
            <div className="message-content">
              <LoadingDots>
                <span></span>
                <span></span>
                <span></span>
              </LoadingDots>
            </div>
          </Message>
        )}
        {error && (
          <Message isUser={false}>
            <div className="message-content">
              <div>Sorry, I encountered an error: {error}</div>
              <RetryButton onClick={handleRetry}>
                <FiRefreshCw /> Retry
              </RetryButton>
            </div>
          </Message>
        )}
      </ChatMessages>
      <ChatInput onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          <FiSend />
        </button>
      </ChatInput>
    </div>
  )
}

export default Chat