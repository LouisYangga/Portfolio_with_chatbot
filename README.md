# Portfolio with AI Assistant

A modern, interactive portfolio website featuring an AI-powered chatbot assistant. This project combines a React frontend with a Node.js backend, incorporating advanced features like AI-driven conversations, resume management, and dynamic content updates.

## Features

- 🤖 **AI Assistant**: Interactive chatbot powered by OpenAI's GPT models
- 🔍 **Smart Knowledge Base**: Vector-based search using Pinecone for accurate information retrieval
- 📝 **Dynamic Content Management**: Admin panel for real-time content updates
- 📄 **Resume Management**: AWS S3 integration for resume storage and retrieval
- 📧 **Contact System**: Email integration using Nodemailer
- 🔐 **Secure Authentication**: JWT-based admin authentication
- 💫 **Modern UI**: Responsive design with smooth animations using Framer Motion
- 🔄 **Server Monitoring**: UptimeRobot integration to prevent idle timeout on free hosting plans

## Technology Stack

### Frontend
- React
- Styled Components
- Framer Motion
- React Icons

### Backend
- Node.js & Express
- MongoDB with Mongoose
- OpenAI API
- Pinecone Vector Database
- AWS S3
- JSON Web Tokens (JWT)
- Nodemailer

## Project Structure

```
portfolio-project/
├── portfolio-frontend/     # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # Styled components
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
│
└── portfolio-ai-api/       # Node.js backend server
    ├── controller/         # Route controllers
    ├── middleware/         # Express middleware
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── utils/              # Utility functions
    └── logs/               # Activity logs
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
- Natural language understanding using OpenAI's GPT models
- Context-aware responses about your background, skills, and projects
- Category-based knowledge retrieval
- Fallback to semantic search for comprehensive responses

### Admin Panel
- Triple-click the logo to access admin login
- Content management features:
  - Add/Update/Delete knowledge entries
  - Upload and manage resume
  - Track content changes through activity logs

### Contact System
- Secure email forwarding
- Form validation
- Automated email notifications

### Keep-Alive System
- UptimeRobot integration to prevent the server from sleeping
- Cost-efficient API warm-up functionality
- Monitoring endpoint that checks server and database health

## Security Features

- API key authentication for endpoints
- JWT-based admin authentication
- Secure file uploads with type verification
- CORS protection
- Environment variable security

## Deployment

The application is deployed as two separate services:

1. Frontend: Deploy to Vercel, Netlify, or similar static hosting platforms
   - Configure environment variables in the hosting platform dashboard
   - Set `VITE_API_URL` to your deployed backend URL

2. Backend: Deployed on Render (https://portfolio-with-chatbot.onrender.com)
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

- OpenAI for GPT API
- Pinecone for vector database
- AWS for S3 storage
- MongoDB for database services
- Render for backend hosting
- UptimeRobot for monitoring services