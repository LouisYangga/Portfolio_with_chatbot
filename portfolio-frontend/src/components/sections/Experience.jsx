import { motion } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import { reveal } from '../../utils/motion'
import { ExperienceSection } from '../../styles/SectionStyles'

// Most recent role first. The section (and its nav link) stays hidden
// while this list is empty.
//
// Example entry:
// {
//   role: 'Software Engineer',
//   company: 'Company Name',
//   companyUrl: 'https://example.com',   // optional
//   location: 'Sydney, NSW',             // optional
//   period: 'Mar 2025 – Present',
//   points: [
//     'What you built or owned, and the result (numbers if you have them)',
//   ],
//   tech: ['Node.js', 'PostgreSQL'],      // optional
// },
export const experience = [
  {
    role: 'Full Stack Developer',
    company: 'Micromax',
    location: 'Unanderra, NSW · Full-time',
    period: 'Aug 2025 – Present',
    points: [
      'Designed and shipped a conversational AI chatbot for the business, owning prompt design, conversation flow, backend/API integration and on-scope handling of model responses.',
      'Built a KPI Dashboard & Reporting System (Node.js/Express REST APIs, React, MongoDB) that turns operational data into business dashboards, refined through live trials and user feedback.',
      'Built core components of an RMA (returns authorisation) workflow integrating Microsoft Graph API (OAuth 2.0), AWS S3, SQS and API Gateway, and diagnosed issues across its event-driven pipeline.',
      'Implemented OAuth 2.0, input validation, access controls and secure API design to protect business data.',
      'Worked with stakeholders on requirements, and wrote system specs, architecture diagrams and user guides in an Agile team.',
    ],
    tech: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'MongoDB', 'AWS', 'OpenAI API', 'Microsoft Graph'],
  },
]

const Experience = () => {
  if (experience.length === 0) return null

  return (
    <ExperienceSection id="experience">
      <motion.div {...reveal()}>
        <h2 className="section-heading">Experience</h2>
        <ol className="timeline">
          {experience.map((job, i) => (
            <motion.li
              key={`${job.company}-${job.period}`}
              className="timeline-item"
              {...reveal(Math.min(i, 3) * 0.05)}
            >
              <p className="period">{job.period}</p>
              <h3>
                {job.role}{' '}
                <span className="company">
                  @{' '}
                  {job.companyUrl ? (
                    <a href={job.companyUrl} target="_blank" rel="noopener noreferrer">
                      {job.company}
                      <FiExternalLink aria-hidden="true" />
                    </a>
                  ) : (
                    job.company
                  )}
                </span>
              </h3>
              {job.location && <p className="location">{job.location}</p>}
              <ul className="points">
                {job.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
              {job.tech?.length > 0 && (
                <ul className="tech" aria-label="Technologies used">
                  {job.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </ExperienceSection>
  )
}

export default Experience
