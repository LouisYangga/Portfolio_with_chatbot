import styled from 'styled-components'

export const ChatbotSection = styled.section`
  margin: 0 auto;
  padding: 60px 0;
  max-width: 1000px;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const ChatDescription = styled.div`
  margin-bottom: 2rem;
  max-width: 700px;
  text-align: left;

  h2 {
    margin-bottom: 1rem;
  }

  p {
    color: var(--slate);
  }
`

export const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  isolation: isolate;
`

export const ChatButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background-color: transparent;
  border: 1px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);

  &:hover {
    background-color: rgba(100,255,218,0.1);
    transform: translateY(-3px);
  }
`