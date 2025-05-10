import { useState, useRef } from 'react'
import { FiMenu, FiGithub, FiLinkedin } from 'react-icons/fi'
import { 
  MainContent, 
  StyledHeader, 
  Nav, 
  NavLinks, 
  NavLink, 
  SocialLinks, 
  HamburgerButton, 
  LogoLink, 
  LogoSVG,
  LogoRect,
  LogoText
} from './styles/StyledComponents'
import Hero from './components/sections/Hero'
import Chatbot from './components/sections/Chatbot'
import About from './components/sections/About'
import Work from './components/sections/Work'
import Contact from './components/sections/Contact'
import MobileMenu from './components/MobileMenu'
import Education from './components/sections/Education'

function App() {
  const homeRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app">
      <StyledHeader>
        <Nav>
          <LogoLink href="#home" aria-label="home">
            <LogoSVG id="logo">
              <LogoRect className="logo-border" />
              <LogoText className="logo-text">
                LY
              </LogoText>
            </LogoSVG>
          </LogoLink>

          <NavLinks>
            <NavLink href="#home">Home</NavLink>
            <NavLink href="#chatbot">AI Assistant</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#education">Education</NavLink>
            <NavLink href="#work">Work</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </NavLinks>

          <SocialLinks>
            <a href="https://github.com/LouisYangga" target="_blank" rel="noopener noreferrer">
              <FiGithub />
            </a>
            <a href="https://linkedin.com/in/louis-yangga" target="_blank" rel="noopener noreferrer">
              <FiLinkedin />
            </a>
          </SocialLinks>

          <HamburgerButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <FiMenu />
          </HamburgerButton>
        </Nav>
      </StyledHeader>

      <MainContent>
        <section id="home" ref={homeRef}>
          <Hero />
        </section>
        <section id="chatbot">
          <Chatbot />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="education">
          <Education />
        </section>
        <section id="work">
          <Work />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </MainContent>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  )
}

export default App
