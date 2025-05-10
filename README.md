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
│   │   ├── styles/        # Styled components
│   │   └── hooks/         # Custom React hooks
│   └── public/            # Static assets
│
└── portfolio-ai-api/      # Node.js backend server
    ├── controller/        # Route controllers
    ├── middleware/        # Express middleware
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    └── utils/            # Utility functions
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
```

Backend (.env):
```
PORT=3000
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
EMAIL_USER=your_email
EMAIL_APP_PASSWORD=your_email_app_password
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

## Security Features

- API key authentication for endpoints
- JWT-based admin authentication
- Secure file uploads with type verification
- CORS protection
- Environment variable security

## Deployment

The application is designed to be deployed as two separate services:

1. Frontend: Can be deployed to Vercel, Netlify, or similar platforms
2. Backend: Suitable for deployment on AWS, Heroku, or similar services

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