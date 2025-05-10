import styled from 'styled-components'
import { motion } from 'framer-motion'

export const ChatSection = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  background-color: var(--navy);
  box-shadow: 0 5px 40px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--lightest-navy);
  position: relative;
  isolation: isolate;
  height: fit-content;
`

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background-color: var(--light-navy);
  border-bottom: 1px solid var(--lightest-navy);

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h3 {
    font-size: var(--fz-lg);
    color: var(--lightest-slate);
    margin: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fz-xs);
    color: var(--green);

    &::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: var(--green);
      border-radius: 50%;
    }
  }

  button {
    background: transparent;
    color: var(--slate);
    border: none;
    padding: 8px;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--green);
    }
  }
`

export const ChatMessages = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--navy);
  min-height: 400px;
  max-height: 500px;
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scroll-behavior: auto;
  will-change: scroll-position;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--lightest-navy);
    border-radius: 3px;
  }

  & > *:last-child {
    scroll-snap-align: end;
  }
`

export const Message = styled.div`
  display: flex;
  justify-content: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 1.25rem;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-content {
    max-width: 85%;
    padding: 12px 16px;
    background-color: ${({ isUser }) => (isUser ? 'var(--green)' : 'var(--light-navy)')};
    color: ${({ isUser }) => (isUser ? 'var(--navy)' : 'var(--lightest-slate)')};
    border-radius: ${({ isUser }) => (isUser ? '16px 16px 0 16px' : '16px 16px 16px 0')};
    font-size: var(--fz-md);
    line-height: 1.5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    a {
      color: ${({ isUser }) => (isUser ? 'var(--navy)' : 'var(--green)')};
      text-decoration: none;
      border-bottom: 1px dashed currentColor;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export const ChatInput = styled.form`
  display: flex;
  padding: 1.25rem;
  gap: 12px;
  background-color: var(--light-navy);
  border-top: 1px solid var(--lightest-navy);

  input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--lightest-navy);
    border-radius: 24px;
    background-color: var(--navy);
    color: var(--lightest-slate);
    font-size: var(--fz-md);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--green);
      box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.1);
    }

    &::placeholder {
      color: var(--slate);
    }
  }

  button {
    width: 42px;
    height: 42px;
    padding: 0;
    background-color: var(--green);
    color: var(--navy);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(100, 255, 218, 0.2);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`

export const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  
  span {
    width: 4px;
    height: 4px;
    background-color: var(--green);
    border-radius: 50%;
    opacity: 0.7;
    animation: bounce 0.8s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
`

export const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--green);
  color: var(--green);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: var(--fz-sm);
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(100, 255, 218, 0.1);
    transform: translateY(-2px);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`