import styled from 'styled-components'
import {
  ModalOverlay as AdminModalOverlay,
  ModalContent as AdminModalContent,
  CloseButton as AdminCloseButton,
  Form as AdminForm,
  Input as AdminInput,
  SubmitButton as AdminSubmitButton,
  StatusMessage as AdminStatusMessage
} from './AdminStyles'

// DemoLoginModal Styles (reusing AdminStyles)
export const ModalOverlay = AdminModalOverlay
export const ModalContent = AdminModalContent
export const CloseButton = AdminCloseButton
export const Form = AdminForm
export const Input = AdminInput
export const SubmitButton = AdminSubmitButton
export const StatusMessage = AdminStatusMessage

// UserDashboardModal Styles
export const DashboardModalContent = styled(ModalContent)`
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`

export const DashboardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const SectionTitle = styled.h3`
  color: var(--lightest-slate);
  margin-bottom: 1rem;
`

export const LogsContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background: var(--navy);
  border-radius: 4px;
  padding: 1rem;
`

export const LogItem = styled.div`
  padding: 0.5rem;
  border-bottom: ${props => props.isLast ? 'none' : '1px solid var(--lightest-navy)'};
  font-size: var(--fz-sm);
  font-family: var(--font-mono);
`

export const LogStep = styled.div`
  color: var(--lightest-slate);
  margin-bottom: 0.25rem;
`

export const LogStatus = styled.div`
  color: var(--slate);
  font-size: 0.75rem;
`

export const LogEmail = styled.div`
  color: var(--green);
  font-size: 0.75rem;
`

export const EmptyLogsMessage = styled.div`
  text-align: center;
  color: var(--slate);
  padding: 2rem;
  background: var(--navy);
  border-radius: 4px;
`

export const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--slate);
  cursor: pointer;
  
  &:hover {
    color: var(--green);
  }
`

export const PasswordInputContainer = styled.div`
  position: relative;
`

export const LogsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

export const RetrieveLogsButton = styled(SubmitButton)`
  width: auto;
  margin: 0;
` 