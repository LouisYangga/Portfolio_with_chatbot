import styled from 'styled-components'
import { motion } from 'framer-motion'

export const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  z-index: 11;
  padding: 0px 50px;
  width: 100%;
  height: 70px;
  background-color: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(10px);
  transition: var(--transition);
  filter: none !important;
  pointer-events: auto !important;
  user-select: auto !important;
`

export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  counter-reset: item 0;
  z-index: 12;
  height: 40px;
`

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    display: none;
  }
`

export const NavLink = styled.a`
  color: var(--lightest-slate);
  font-size: var(--fz-sm);
  
  &:hover {
    color: var(--green);
  }
`

export const SocialLinks = styled.div`
  display: flex;
  gap: 20px;

  a {
    color: var(--lightest-slate);
    font-size: 20px;
    
    &:hover {
      color: var(--green);
      transform: translateY(-3px);
    }
  }
`

export const MainContent = styled.main`
  margin: 0 auto;
  width: 100%;
  max-width: 1600px;
  padding: 0 150px;
  position: relative;

  @media (max-width: 1080px) {
    padding: 0 100px;
  }
  @media (max-width: 768px) {
    padding: 0 50px;
  }
  @media (max-width: 480px) {
    padding: 0 25px;
  }

  section {
    margin: 0 auto;
    max-width: 1000px;
    scroll-margin-top: 20px;
  }

  #home {
    min-height: 100vh;
    padding-top: 50px; /* Offset for header height */
  }

  #chatbot {
    min-height: 70vh;
    padding-top: 20px;
  }
  #education{
    min-height: 70vh;
    padding-top: 5px;
  }
  #about{
    min-height: 50vh;
    padding-top: 10px;
    padding-bottom: 20px;
  }  
  #work {
    min-height: 50vh;
    padding-top: 10px;
  }   
  #contact{
    min-height: 100vh;
    padding-top: 50px;
  }
`

export const Section = styled.section`
  margin: 0 auto;
  padding: 60px 0;
  max-width: 1000px;
`

export const HamburgerButton = styled.button`
  display: none;
  border: 0;
  background: transparent;
  color: var(--green);
  z-index: 15;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`

export const MobileMenu = styled(motion.div)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: min(75vw, 400px);
    outline: 0;
    background-color: var(--light-navy);
    box-shadow: -10px 0px 30px -15px var(--navy-shadow);
    z-index: 14;
    
    nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      width: 100%;
      
      a {
        font-size: var(--fz-lg);
        padding: 15px;
        width: 100%;
        text-align: center;
      }
    }
  }
`