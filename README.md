# AI-Powered Portfolio Assistant

Welcome to my next-generation portfolio featuring an advanced AI assistant that combines OpenAI's GPT models with vector search capabilities. Unlike traditional static portfolios, this project demonstrates the power of AI-driven interactions while showcasing my professional experience and technical skills.

## 🤖 AI Features Showcase

### Intelligent Assistant
- **Natural Conversations**: Engage in meaningful discussions about my background, skills, and projects
- **Context-Aware Responses**: The AI maintains conversation context for more natural interactions
- **Smart Resume Handling**: Automatically processes resume requests with secure download links
- **Vector-Based Knowledge**: Uses Pinecone for accurate information retrieval and responses

### How It Works
```
User Query → Context Analysis → Vector Search → GPT Processing → Smart Response
```

- **Query Processing**: Advanced natural language understanding
- **Vector Search**: Semantic matching using Pinecone database
- **Context Management**: Real-time knowledge base updates
- **Security**: Protected routes and secure file handling

### AI Architecture
- OpenAI GPT models for natural language processing
- Pinecone vector database for semantic search
- MongoDB for dynamic knowledge management
- AWS S3 for secure document handling

## Technology Stack

### Frontend
- React with Vite
- Styled Components for modular styling
- Framer Motion for fluid animations
- React Icons
- ESLint for code quality

### Backend
- Node.js & Express
- MongoDB with Mongoose
- OpenAI API Integration
- Pinecone Vector Database
- AWS S3 for document storage
- JWT-based authentication
- Nodemailer for email handling
- Winston for logging

### Demo System
#### Onboarding Automation
- Socket.IO for real-time communication
- WebSocket integration for live updates
- User authentication system
- Real-time log processing
- Dashboard management interface

## Project Structure

```
portfolio-project/
├── portfolio-frontend/     # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── DemoLoginModal.jsx      # Demo login modal
│   │   │   ├── UserDashboardModal.jsx  # User dashboard
│   │   │   ├── OnboardingDemoPage.jsx  # Demo page
│   │   │   ├── OnboardingDemoForm.jsx  # Demo form
│   │   │   └── OnboardingDemoLogs.jsx  # Live logs display
│   │   ├── sections/      # Page sections
│   │   ├── hooks/        # Custom React hooks
│   │   └── styles/       # Styled components
│   │       ├── AdminStyles.js    # Admin styling
│   │       └── DemoStyles.js     # Demo-specific styling
│   └── public/           # Static assets
│
└── portfolio-ai-api/      # Node.js backend
    ├── config/           # Configuration files
    ├── controller/       # Route controllers
    ├── middleware/       # Express middleware
    ├── models/          # Database models
    ├── routes/          # API endpoints
    ├── utils/           # Utility functions
    └── data/           # Knowledge base data
```

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio-with-chatbot.git
cd portfolio-with-chatbot
```

2. Install dependencies for both frontend and backend:
```bash
# Frontend
cd portfolio-frontend
npm install

# Backend
cd ../portfolio-ai-api
npm install
```

3. Set up environment variables:
- Create `.env` files in both frontend and backend directories
- Configure the following variables:

Frontend (.env):
```
VITE_API_KEY=your_api_key
VITE_API_URL=your_backend_url
VITE_ONBOARDING_API=your_onboarding_api_url
VITE_ONBOARDING_API_KEY=your_onboarding_api_key
```

Backend (.env):
```
PORT=3000
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_pinecone_index
PINECONE_INDEX_HOST=your_pinecone_host
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_s3_bucket_name
EMAIL_USER=your_email
EMAIL_RECIPIENT=your_recipient_email
EMAIL_APP_PASSWORD=your_email_app_password
API_KEY=your_api_key
```

4. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
node index.js
```

## Features in Detail

### AI Assistant
- Natural language processing with GPT models
- Context-aware responses about professional background
- Vector-based semantic search for accurate information retrieval
- Intelligent resume-related query handling

### Interactive Demo Section
- **Onboarding Automation Demo**: Live simulation of employee onboarding process
  - Real-time form processing with Socket.IO integration
  - Live terminal-style logs showing process steps
  - User authentication with email/password login
  - User dashboard with password management and activity logs
  - Responsive design with modern UI components

#### Demo Features:
- **Real-time Processing**: Live updates via WebSocket connections
- **User Authentication**: Secure login system with demo credentials
- **Dashboard Access**: Post-login user dashboard with:
  - Password update functionality
  - Activity log retrieval and display
  - Real-time status updates
- **Process Simulation**: Complete onboarding workflow simulation
- **Error Handling**: Comprehensive error management and user feedback

### Admin Dashboard
- Secure triple-click access mechanism
- Real-time knowledge base management
- Activity logging and monitoring
- Resume upload and management

### Contact System
- Secure email forwarding
- Form validation
- Automated email notifications

### Keep-Alive System
- UptimeRobot integration to prevent the server from sleeping
- Cost-efficient API warm-up functionality
- Monitoring endpoint that checks server and database health

### Security Implementation
- API key authentication
- JWT-based admin access
- Secure file handling
- Rate limiting and CORS protection
- Environment variable security

## Deployment

The application is deployed as two separate services:

1. Frontend: Deploy to Vercel, Netlify, or similar static hosting platforms
   - Configure environment variables in the hosting platform dashboard
   - Set `VITE_API_URL` to your deployed backend URL

2. Backend: Deployed on Render
   - Configure environment variables in the Render dashboard
   - Set up a keep-alive monitor with UptimeRobot to prevent idle timeout

### Setting Up UptimeRobot

1. Create a free account at [UptimeRobot](https://uptimerobot.com/)
2. Add a new HTTP(s) monitor
3. Set the URL to `https://your-backend-url.com/api/keep-alive`
4. Set the monitoring interval (recommended: 5 minutes)
5. Save the monitor to start automatic pinging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from [Brittany Chiang](https://brittanychiang.com)
- OpenAI for GPT API
- Pinecone for vector database
- AWS for S3 storage
- MongoDB for database services
- Render for backend hosting
- UptimeRobot for monitoring services