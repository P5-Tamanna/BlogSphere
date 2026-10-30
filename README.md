# BlogSphere

A full-stack blog platform built with **React 18**, **Node.js / Express** and **MongoDB**. Users can register, write posts with a rich text editor, upload images, and interact with posts through comments, likes and bookmarks.

## Features

### Content
- **Rich text editor** (React Quill) for creating and editing posts
- **Featured image upload** (up to 5 MB, images only)
- **Categories and tags**
- **Draft system**: save drafts and publish when ready
- **Blog page** with category filter, sorting (newest, oldest, most viewed) and pagination
- **Grid and list views**

### Users
- **Register and login** with JWT authentication and hashed passwords
- **Personal dashboard** with post statistics, recent posts (including drafts) and saved posts
- **Profile page** with bio, website and social links
- **Role-based access**: authors can edit and delete their own posts, admins can manage any post

### Interaction
- **Comments** on every post (login required)
- **Likes**: one like per user per post, with a live counter
- **Bookmarks**: save posts and find them on your dashboard
- **View counter** on every post

## Tech Stack

**Frontend:** React 18, React Router, React Query, React Hook Form, React Quill, Tailwind CSS, Lucide React, React Hot Toast, Axios

**Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, bcryptjs, Multer, CORS

## Getting Started

### Prerequisites
- Node.js 16 or higher
- MongoDB running locally (or a MongoDB Atlas connection string)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/P5-Tamanna/BlogSphere.git
cd BlogSphere
```

### 2. Install dependencies
All dependencies (frontend and backend) are in the root `package.json`:
```bash
npm install
```

### 3. Configure environment variables
Copy the example file and edit it.

macOS / Linux:
```bash
cp env.example .env
```
Windows:
```bash
copy env.example .env
```

Your `.env` should look like this:
```
MONGODB_URI=mongodb://localhost:27017/blogplatform
JWT_SECRET=change-this-to-a-long-random-string
PORT=5001
REACT_APP_API_URL=http://localhost:5001/api
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```
**Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Start MongoDB
Make sure MongoDB is running (for example `mongod`, or the MongoDB service on Windows). The app creates the database and collections automatically.

### 5. Run the app
```bash
npm run dev
```
This starts the API and the React app together.

- Frontend: http://localhost:3000
- API: http://localhost:5001/api

To run only one part: `npm run server` (API) or `npm run client` (React).

### Making a user an admin
Open the `users` collection in MongoDB (for example with MongoDB Compass) and set the user's `role` field to `admin`. Admins can edit and delete any post.

## Project Structure

```
BlogSphere/
├── public/                  # index.html and static assets
├── src/
│   ├── components/          # Navbar, Footer, BlogCard, ProtectedRoute, LoadingSpinner
│   ├── contexts/            # AuthContext (login state)
│   ├── pages/               # Home, Blog, BlogPost, Dashboard, CreatePost, EditPost,
│   │                        # Profile, Settings, Login, Register, About, Contact
│   ├── services/            # api.js (Axios API calls)
│   ├── utils/               # postHelpers.js (image URLs, dates, colors)
│   ├── App.js               # Routes
│   ├── index.js             # Entry point
│   └── index.css            # Global styles and Tailwind
├── server/
│   ├── models/              # User, Post, Category, Comment
│   └── index.js             # Express API (all routes)
├── uploads/                 # Uploaded images
├── env.example              # Example environment variables
├── tailwind.config.js
└── package.json
```
The `.html` files, `script.js` and `styles.css` in the root are an early static prototype and are not used by the React app.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/profile` | Get the logged-in user |
| PUT | `/api/auth/profile` | Update the profile |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | List published posts (pagination, category, sort, author) |
| GET | `/api/posts/:id` | Get one post with its comments, likes and bookmark state |
| POST | `/api/posts` | Create a post (login required) |
| PUT | `/api/posts/:id` | Update a post (author or admin) |
| DELETE | `/api/posts/:id` | Delete a post (author or admin) |
| POST | `/api/posts/:id/comments` | Add a comment (login required) |
| POST | `/api/posts/:id/like` | Like or unlike a post (login required) |
| POST | `/api/posts/:id/bookmark` | Bookmark or unbookmark a post (login required) |
| GET | `/api/bookmarks` | Get your saved posts (login required) |

### Categories and comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create a category (login required) |
| GET | `/api/comments/post/:postId` | List comments of a post |
| POST | `/api/comments` | Create a comment (login required) |

### Uploads
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/image` | Upload an image (login required), returns its `/uploads/...` address |

## Usage

1. Register an account or log in.
2. Open the **Dashboard** and click **Create New Post**.
3. Add a title, excerpt, category, tags, a featured image and your content.
4. Click **Save Draft** or **Publish Post**.
5. Open any post to comment, like or bookmark it. Saved posts appear on your Dashboard.

## Deployment notes

- Use **MongoDB Atlas** for a hosted database and set `MONGODB_URI` in your hosting dashboard.
- Set a strong, random `JWT_SECRET` in production.
- Uploaded images are stored on the server's disk (`uploads/`). Most hosting platforms reset the disk on every deploy, so use a storage service such as Cloudinary or AWS S3 in production.
- Build the frontend with `npm run build` and deploy the `build` folder to a static host (Netlify, Vercel). Set `REACT_APP_API_URL` to your deployed API address before building.

## Roadmap

- [ ] Working search on the blog page
- [ ] Change password and forgot password (email reset)
- [ ] Edit and delete comments
- [ ] Moderator role and comment moderation
- [ ] Email notifications
- [ ] Share button (copy link)
- [ ] Cloud image storage
- [ ] Advanced analytics on the dashboard

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add feature"`
4. Push the branch: `git push origin feature-name`
5. Open a pull request

## License

MIT License.

---

Built with React, Node.js and MongoDB.