import styled from 'styled-components'
import { Section } from './StyledComponents'

export const Hero = styled(Section)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding-top: 70px; /* Account for header */
  margin: 0 auto;

  h1 {
    margin: 1 0 30px 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: clamp(var(--fz-sm), 5vw, var(--fz-md));
    font-weight: 400;
  }

  h2 {
    font-size: clamp(40px, 8vw, 80px);
  }

  h3 {
    margin-top: 10px;
    color: var(--slate);
    line-height: 0.9;
    font-size: clamp(40px, 8vw, 80px);
  }
`

export const AboutSection = styled(Section)`
  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 50px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .about-text {
    p {
      margin-bottom: 15px;
    }
  }

  .skills-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 200px));
    gap: 0 10px;
    padding: 0;
    margin: 20px 0 0 0;
    overflow: hidden;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);

      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: var(--green);
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }
`

export const EducationSection = styled(Section)`
  margin: 0 auto;
  padding: 60px 0;
  max-width: 1000px;

  .inner {
    display: flex;
    flex-direction: column;
  }

  .tab-list {
    display: flex;
    flex-direction: column;
    margin-bottom: 30px;
    width: max-content;
    border-left: 2px solid var(--lightest-navy);
  }

  .tab-button {
    display: flex;
    align-items: center;
    width: 100%;
    height: 42px;
    padding: 0 20px;
    border: none;
    background-color: transparent;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    text-align: left;
    white-space: nowrap;

    &:hover {
      background-color: var(--light-navy);
      color: var(--green);
    }

    &.active {
      color: var(--green);
      border-left: 2px solid var(--green);
      margin-left: -2px;
    }
  }

  .tab-content {
    margin-left: 20px;
    
    h3 {
      margin-bottom: 0.5rem;
      font-size: var(--fz-xxl);
      font-weight: 500;
    }

    h4 {
      margin-bottom: 1rem;
      font-size: var(--fz-lg);
      color: var(--slate);
    }

    ul {
      padding-left: 20px;
      
      li {
        position: relative;
        padding-left: 20px;
        margin-bottom: 10px;
        color: var(--slate);
        
        &:before {
          content: '▹';
          position: absolute;
          left: 0;
          color: var(--green);
        }
      }
    }
  }

  @media (max-width: 768px) {
    .tab-list {
      flex-direction: row;
      overflow-x: auto;
      margin-bottom: 30px;
      border-left: none;
      border-bottom: 2px solid var(--lightest-navy);
    }

    .tab-button {
      border-left: none;
      border-bottom: 2px solid transparent;
      padding: 0 15px;

      &.active {
        border-left: none;
        border-bottom: 2px solid var(--green);
        margin-left: 0;
        margin-bottom: -2px;
      }
    }

    .tab-content {
      margin-left: 0;
    }
  }
`

export const WorkSection = styled(Section)`
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
    position: relative;
    margin-top: 50px;
  }

  .project-card {
    position: relative;
    cursor: default;
    background-color: var(--light-navy);
    padding: 2rem 1.75rem;
    border-radius: 4px;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-5px);
    }
  }
`

export const DemoSection = styled(Section)`
  .section-description {
    color: var(--slate);
    font-size: var(--fz-lg);
    margin-bottom: 50px;
    text-align: center;
  }

  .demos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    position: relative;
    margin-top: 50px;
  }

  .demo-card {
    position: relative;
    cursor: default;
    background-color: var(--light-navy);
    padding: 2rem 1.75rem;
    border-radius: 4px;
    transition: transform 0.2s ease;
    border: 1px solid transparent;
    display: flex;
    flex-direction: column;
    height: 100%;

    &:hover {
      transform: translateY(-5px);
      border-color: var(--green);
    }
  }

  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .demo-icon {
    color: var(--green);
    font-size: 1.5rem;
  }

  .demo-links {
    display: flex;
    gap: 10px;

    a {
      color: var(--slate);
      font-size: 1.2rem;
      transition: color 0.2s ease;

      &:hover {
        color: var(--green);
      }
    }
  }

  .demo-title {
    font-size: var(--fz-lg);
    margin-bottom: 1rem;
    color: var(--lightest-slate);
  }

  .demo-description {
    color: var(--slate);
    margin-bottom: 1.5rem;
    line-height: 1.6;
    text-align: justify;
  }

  .demo-tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 1.5rem;
  }

  .tech-tag {
    background-color: var(--green);
    color: var(--navy);
    padding: 4px 8px;
    border-radius: 3px;
    font-size: var(--fz-xs);
    font-family: var(--font-mono);
    font-weight: 500;
  }

  .demo-button {
    width: 100%;
    padding: 12px 20px;
    background-color: transparent;
    border: 1px solid var(--green);
    border-radius: 4px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);
    margin-top: auto;

    &:hover:not(:disabled) {
      background-color: rgba(100,255,218,0.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    .demos-grid {
      grid-template-columns: 1fr;
    }
  }
`

export const ContactSection = styled(Section)`
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 0;
  text-align: center;

  .contact-title {
    font-size: var(--fz-md);
    color: var(--green);
    font-family: var(--font-mono);
    margin-bottom: 20px;
  }

  h2 {
    font-size: clamp(40px, 5vw, 60px);
  }

  p {
    color: var(--slate);
    margin: 20px 0;
  }

  .email-link {
    margin-top: 50px;
    padding: 1.25rem 1.75rem;
    background-color: transparent;
    border: 1px solid var(--green);
    border-radius: 4px;
    font-size: var(--fz-sm);
    font-family: var(--font-mono);
    line-height: 1;
    text-decoration: none;
    color: var(--green);
    transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);

    &:hover,
    &:focus {
      background-color: rgba(100,255,218,0.1);
    }
  }
`