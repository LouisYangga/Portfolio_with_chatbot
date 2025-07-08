import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { FiMenu, FiGithub, FiLinkedin } from 'react-icons/fi'
import { MainContent, StyledHeader, Nav, NavLinks, NavLink, SocialLinks, HamburgerButton, LogoLink, LogoSVG, LogoRect, LogoText } from './styles/StyledComponents'
import Hero from './components/sections/Hero'
import Chatbot from './components/sections/Chatbot'
import About from './components/sections/About'
import Work from './components/sections/Work'
import Contact from './components/sections/Contact'
import Demo from './components/sections/Demo'
import MobileMenu from './components/MobileMenu'
import Education from './components/sections/Education'
import AdminModal from './components/AdminModal'
import AdminPanel from './components/AdminPanel'
import OnboardingDemoPage from './components/OnboardingDemoPage';

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);
  return null;
}

function App() {
  const homeRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
    }
  }, []);

  const handleLogoClick = (e) => {
    if (e.detail === 3) { // Triple click
      e.preventDefault(); // Only prevent default for triple click
      setIsAdminModalOpen(true);
    }
  };

  const handleLogin = (token) => {
    setAdminToken(token);
  };

  // We keep this function for potential use elsewhere, but remove it from the header
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  return (
    <Router>
      <div className="app">
        <StyledHeader>
          <Nav>
            <LogoLink href="#home" aria-label="home" onClick={handleLogoClick}>
              <LogoSVG id="logo">
                <LogoRect className="logo-border" />
                <LogoText className="logo-text">
                  LY
                </LogoText>
              </LogoSVG>
            </LogoLink>

            <NavLinks>
              <NavLink href="/#home">Home</NavLink>
              <NavLink href="/#chatbot">AI Assistant</NavLink>
              <NavLink href="/#about">About</NavLink>
              <NavLink href="/#education">Education</NavLink>
              <NavLink href="/#work">Work</NavLink>
              <NavLink href="/#demo">Demo(s)</NavLink>
              <NavLink href="/#contact">Contact</NavLink>
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

        <ScrollToHash /> {/* This is the line that scrolls to the hash */}
        <Routes>
          <Route path="/" element={
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
              <section id="demo">
                <Demo />
              </section>
              <section id="contact">
                <Contact />
              </section>
            </MainContent>
          } />
          <Route path="/onboarding-demo" element={<OnboardingDemoPage />} />
        </Routes>

        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <AdminModal 
          isOpen={isAdminModalOpen} 
          onClose={() => setIsAdminModalOpen(false)}
          onLogin={handleLogin}
        />
        {adminToken && <AdminPanel token={adminToken} />}
      </div>
    </Router>
  );
}

export default App
