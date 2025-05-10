import styled, { keyframes } from 'styled-components'

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 8px;
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: var(--green);
  border-radius: 50%;
  animation: ${bounce} 0.8s infinite;
  animation-delay: ${props => props.$delay}s;
`

const LoadingIndicator = () => {
  return (
    <LoadingContainer>
      <Dot $delay={0} />
      <Dot $delay={0.2} />
      <Dot $delay={0.4} />
    </LoadingContainer>
  )
}

export default LoadingIndicator