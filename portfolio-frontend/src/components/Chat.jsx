import { useState, useEffect, useRef } from 'react'
import { FiX, FiSend, FiRefreshCw } from 'react-icons/fi'
import { AnimatePresence } from 'framer-motion'
import {
  ChatSection,
  ChatHeader,
  ChatMessages,
  Message,
  ChatInput,
  LoadingDots,
  RetryButton
} from '../styles/ChatStyles'

const API_URL = import.meta.env.VITE_API_URL;

const Chat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        text: "Hi! I'm Louis's AI assistant. I can help you learn more about Louis's experience, skills, and projects. What would you like to know?",
        isUser: false
      }])
    }
  }, [isOpen])

  const adjustScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }

  // Handle new messages
  useEffect(() => {
    adjustScroll();
  }, [messages])

  const renderMessageWithLinks = (text) => {
    const pattern = /((?:mailto:)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(?:\[(.*?)\])?\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s]+/g;
    let lastIndex = 0;
    const elements = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }

      const isEmail = match[1] && match[1].includes('@');
      const url = isEmail ? `mailto:${match[1]}` : (match[3] || match[0]);
      const displayText = isEmail ? match[1] : (match[2] || getLinkDisplayText(url));

      elements.push(
        <a
          key={match.index}
          href={url}
          target={isEmail ? '_self' : '_blank'}
          rel={isEmail ? undefined : 'noopener noreferrer'}
        >
          {displayText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  const getLinkDisplayText = (url) => {
    if (url.includes('linkedin.com')) return 'linkedin.com/in/louis-yangga';
    if (url.includes('github.com')) return 'github.com/LouisYangga';
    if (url.includes('mailto:')) return url.replace('mailto:', '');
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userInput = inputMessage.trim()
    setInputMessage('')
    setError(null)
    setIsLoading(true)

    setMessages(prev => [...prev, { text: userInput, isUser: true }])

    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({ question: userInput })
      })

      const data = await response.json()
      
      if (!response.ok && !data.answer) {
        throw new Error('Network response was not ok')
      }

      setMessages(prev => [...prev, { text: data.answer, isUser: false }])
    } catch (error) {
      console.error('Error:', error)
      setError('Unable to get a response. Please try again.')
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
      const response = await fetch(`${API_URL}/api/ask`, {
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
    <AnimatePresence>
      {isOpen && (
        <ChatSection
          initial={{ y: '20px', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '20px', opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChatHeader>
            <div className="header-content">
              <h3>Louis's AI Assistant</h3>
              <span className="status">online</span>
            </div>
            <button onClick={onClose}>
              <FiX />
            </button>
          </ChatHeader>
          <ChatMessages ref={messagesContainerRef}>
            {messages.map((message, index) => (
              <Message key={index} isUser={message.isUser}>
                <div className="message-content">
                  {message.isUser ? message.text : renderMessageWithLinks(message.text)}
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
            <div ref={messagesEndRef} style={{ height: '1px', width: '100%' }} />
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
        </ChatSection>
      )}
    </AnimatePresence>
  )
}

export default Chat