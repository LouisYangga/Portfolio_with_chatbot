import styled from 'styled-components'
import { motion } from 'framer-motion'

export const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  height: 70px;
  background-color: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(10px);
  transition: var(--transition);
  filter: none !important;
  pointer-events: auto !important;
  user-select: auto !important;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 40px;

  @media (min-width: 1920px) {
    padding: 0 150px;
  }

  @media (max-width: 768px) {
    padding: 0 25px;
  }
`

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  counter-reset: item 0;
  z-index: 12;
  height: 100%;
  justify-content: space-between;
`

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(20px, 2vw, 30px);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  white-space: nowrap;

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
  gap: 15px;
  margin-left: 60px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }

  a {
    color: var(--lightest-slate);
    font-size: 18px;
    display: flex;
    align-items: center;
    transition: var(--transition);
    padding: 10px;
    
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

export const LogoLink = styled.a`
  display: inline-block;
  border-radius: 16px;
  transition: box-shadow 0.3s;

  svg {
    display: block;
  }

  .logo-border {
    stroke-dasharray: 368;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 0.7s;
  }

  &:hover .logo-border {
    stroke-dasharray: 368;
    stroke-dashoffset: 368;
    animation: border-move 0.7s forwards;
  }

  @keyframes border-move {
    to {
      stroke-dashoffset: 0;
    }
  }
`

export const LogoSVG = styled.svg.attrs({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 100 100",
  width: "50",
  height: "50"
})`
  .logo-text {
    font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
    font-weight: bold;
    font-size: 48px;
    fill: #64ffda;
    letter-spacing: 2px;
    filter: drop-shadow(0 2px 8px rgba(100,255,218,0.2));
  }

  .logo-border {
    fill: none;
    stroke: #64ffda;
    stroke-width: 3;
  }
`

export const LogoRect = styled.rect.attrs({
  x: "4",
  y: "4",
  width: "92",
  height: "92",
  rx: "16",
  ry: "16"
})``;

export const LogoText = styled.text.attrs({
  x: "50%",
  y: "55%",
  textAnchor: "middle",
  dominantBaseline: "middle"
})``;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: fit-content;
  position: relative;
  z-index: 3;
`