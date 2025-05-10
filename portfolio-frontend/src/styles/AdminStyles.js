import styled from 'styled-components'
import { motion } from 'framer-motion'

// AdminPanel Styles
export const Panel = styled(motion.div)`
  position: fixed;
  top: 80px;
  right: 20px;
  background: var(--light-navy);
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
  z-index: 1000;
  width: 350px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--navy);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--lightest-navy);
    border-radius: 4px;
    
    &:hover {
      background: var(--slate);
    }
  }
`

export const Section = styled.div`
  margin-bottom: 2rem;

  h3 {
    color: var(--lightest-slate);
    margin-bottom: 1rem;
  }
`

export const Button = styled.button`
  background-color: transparent;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: rgba(100,255,218,0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 4px;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  min-height: 150px;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: var(--green);
  }
`

export const FileInput = styled.input`
  display: none;
`

export const StatusMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
  background-color: ${props => props.$type === 'success' ? 'rgba(100,255,218,0.1)' : 'rgba(255,100,100,0.1)'};
  color: ${props => props.$type === 'success' ? 'var(--green)' : '#ff6b6b'};
  border: 1px solid ${props => props.$type === 'success' ? 'var(--green)' : '#ff6b6b'};
`

// AdminModal Styles
export const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 25, 47, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

export const ModalContent = styled(motion.div)`
  background: var(--light-navy);
  padding: 2rem;
  border-radius: 4px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
`

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--slate);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--green);
  }
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--navy);
  border: 1px solid var(--lightest-navy);
  border-radius: 4px;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);

  &:focus {
    outline: none;
    border-color: var(--green);
  }
`

export const SubmitButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);

  &:hover {
    background-color: rgba(100,255,218,0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`