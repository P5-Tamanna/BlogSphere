# Customizable Blog Platform

A full-featured, customizable blog platform built with React, Node.js, and MongoDB. Features user authentication, content creation, dynamic post display, and a modern responsive design.

## Features

### 🚀 Core Features
- **User Authentication** - Secure login/register with JWT tokens
- **Content Management** - Rich text editor for creating and editing posts
- **Dynamic Blog Display** - Search, filter, and pagination
- **User Dashboard** - Personal dashboard with post management
- **Responsive Design** - Mobile-first, modern UI/UX
- **Real-time Updates** - Live content updates and notifications

### 📝 Content Features
- **Rich Text Editor** - WYSIWYG editor with formatting options
- **Image Upload** - Featured image and media support
- **Categories & Tags** - Organize content with categories and tags
- **SEO Optimization** - Meta tags and SEO-friendly URLs
- **Draft System** - Save drafts and publish when ready
- **Post Analytics** - View counts, likes, and engagement metrics

### 👥 User Management
- **Role-based Access** - User, Admin, and Moderator roles
- **Profile Management** - Customizable user profiles
- **Social Integration** - Social media links and sharing
- **Comment System** - Interactive commenting on posts

### 🎨 Customization
- **Theme Support** - Customizable color schemes
- **Layout Options** - Flexible grid and list views
- **Category Management** - Create and manage content categories
- **Settings Panel** - Comprehensive configuration options

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **React Quill** - Rich text editor
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd customizable-blog-platform
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy the environment example file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

Required environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/blogplatform
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
# Start MongoDB (if not already running)
mongod

# The application will automatically create the database and collections
```

### 5. Run the Application

#### Development Mode (Recommended)
```bash
# Run both frontend and backend concurrently
npm run dev
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend server
npm run server
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
customizable-blog-platform/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Theme, etc.)
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── App.js              # Main App component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── server/
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── index.js            # Server entry point
├── uploads/                # File uploads directory
├── package.json
├── tailwind.config.js
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all posts (with pagination, filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment

### File Upload
- `POST /api/upload/image` - Upload image

## Usage Guide

### Creating Your First Post
1. Register a new account or login
2. Navigate to Dashboard
3. Click "Create New Post"
4. Fill in the post details (title, excerpt, category)
5. Write your content using the rich text editor
6. Upload a featured image (optional)
7. Save as draft or publish immediately

### Managing Categories
1. Go to Dashboard > Settings
2. Navigate to Categories section
3. Add new categories with names and descriptions
4. Assign colors and icons for better organization

### User Management
- **Admin users** can manage all posts and users
- **Regular users** can only manage their own posts
- **Moderators** can approve comments and moderate content

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Customize component styles in individual component files

### Features
- Add new API endpoints in `server/index.js`
- Create new React components in `src/components/`
- Add new pages in `src/pages/`

### Database
- Modify models in `server/models/` directory
- Add new fields or relationships as needed

## Deployment

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Set environment variables in your hosting dashboard

### Backend (Heroku/Railway)
1. Set up MongoDB Atlas for production database
2. Deploy server code to your hosting service
3. Configure environment variables
4. Set up file storage (AWS S3, Cloudinary, etc.)

### Full Stack (VPS)
1. Set up a VPS with Node.js and MongoDB
2. Clone the repository
3. Install dependencies
4. Configure environment variables
5. Use PM2 for process management
6. Set up Nginx as reverse proxy

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

## Roadmap

### Upcoming Features
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced SEO tools
- [ ] Social media integration
- [ ] Comment moderation tools
- [ ] Newsletter system
- [ ] Advanced search with filters
- [ ] Content scheduling
- [ ] User roles and permissions
- [ ] API rate limiting
- [ ] Content backup and restore

---

Built with ❤️ using React, Node.js, and MongoDB

