import styled from 'styled-components'
import { motion } from 'framer-motion'

export const ChatSection = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background-color: var(--light-navy);
  box-shadow: 0 -10px 30px -15px var(--navy-shadow);
  z-index: 15;
  display: flex;
  flex-direction: column;
  transform: translateZ(0); /* Force GPU acceleration */
  /* Removed position: fixed and height: 100vh */
`

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--navy);
  border-bottom: 1px solid var(--lightest-navy);
`

export const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  scroll-behavior: smooth;
  background-color: var(--navy);
  border-radius: 8px;
  height: auto; /* Remove fixed height */
  min-height: 300px;
  max-height: 400px;
  border: 1px solid var(--lightest-navy);
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
`

export const Message = styled.div`
  display: flex;
  justify-content: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 1rem;

  .message-content {
    max-width: 70%;
    padding: 0.75rem 1rem;
    background-color: ${({ isUser }) => (isUser ? 'var(--green)' : 'var(--light-navy)')};
    color: ${({ isUser }) => (isUser ? 'var(--navy)' : 'var(--lightest-slate)')};
    border-radius: 8px;
  }
`

export const ChatInput = styled.form`
  display: flex;
  padding: 1rem;
  gap: 0.5rem;
  background-color: var(--navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 8px;
  margin-top: 1rem;

  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--lightest-navy);
    border-radius: 4px;
    background-color: var(--light-navy);
    color: var(--lightest-slate);
    font-size: var(--fz-sm);

    &:focus {
      outline: none;
      border-color: var(--green);
    }
  }

  button {
    padding: 0.75rem 1rem;
    background-color: var(--green);
    color: var(--navy);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background-color: var(--green-tint);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`

export const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;

  span {
    width: 4px;
    height: 4px;
    background-color: var(--green);
    border-radius: 50%;
    animation: bounce 0.5s infinite alternate;

    &:nth-child(2) { animation-delay: 0.1s; }
    &:nth-child(3) { animation-delay: 0.2s; }
  }

  @keyframes bounce {
    to { transform: translateY(-4px); }
  }
`

export const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--green);
  color: var(--green);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: var(--fz-xs);
  margin-top: 8px;
  cursor: pointer;
  
  &:hover {
    background: rgba(100, 255, 218, 0.1);
  }
`