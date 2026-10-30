const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogplatform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Models
const User = require('./models/User');
const Post = require('./models/Post');
const Category = require('./models/Category');
const Comment = require('./models/Comment');

// Likes and bookmarks (one record per user per post)
const likeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
likeSchema.index({ post: 1, user: 1 }, { unique: true });
const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);

const bookmarkSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
bookmarkSchema.index({ post: 1, user: 1 }, { unique: true });
const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      // 401 so the website logs the user out automatically when the token expires
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Reads the logged-in user if a valid token is sent, but never blocks the request
const getOptionalUser = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (err) {
    return null;
  }
};

// True if the user wrote the post, or has the "admin" role
const canManagePost = async (post, userId) => {
  if (post.author.toString() === String(userId)) return true;
  const requester = await User.findById(userId).select('role');
  return requester?.role === 'admin';
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, website, socialLinks } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, bio, website, socialLinks },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Posts routes
app.get('/api/posts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = 'newest',
      featured,
      author,
    } = req.query;

    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (featured) query.featured = true;
    if (author) {
      query.author = author;
      // The owner can also see their own drafts and archived posts (for the Dashboard)
      const viewer = getOptionalUser(req);
      if (viewer && String(viewer.userId) === String(author)) {
        delete query.status;
      }
    }

    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { views: -1 };
        break;
      case 'views':
        sortOptions = { views: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email bio');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    // Comments come from the Comment model
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    // Like / bookmark info for the person viewing the post
    const viewer = getOptionalUser(req);
    const likesCount = await Like.countDocuments({ post: post._id });
    let liked = false;
    let bookmarked = false;
    if (viewer) {
      liked = !!(await Like.exists({ post: post._id, user: viewer.userId }));
      bookmarked = !!(await Bookmark.exists({ post: post._id, user: viewer.userId }));
    }

    res.json({
      post: { ...post.toObject(), comments, likes: likesCount, liked, bookmarked },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Image can come from a file in the form OR from an address uploaded earlier
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image || null;

    const postData = {
      ...req.body,
      author: req.user.userId,
      image: imagePath,
    };

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email')
      .populate('category', 'name');

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a post
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: post._id,
      author: req.user.userId,
      content,
    });
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like / unlike a post (toggle)
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const filter = { post: post._id, user: req.user.userId };
    const existing = await Like.findOne(filter);
    let liked;
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      liked = false;
    } else {
      await Like.create(filter);
      liked = true;
    }

    const likes = await Like.countDocuments({ post: post._id });
    await Post.findByIdAndUpdate(post._id, { likes }); // keeps Dashboard totals correct
    res.json({ liked, likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bookmark / unbookmark a post (toggle)
app.post('/api/posts/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const filter = { post: post._id, user: req.user.userId };
    const existing = await Bookmark.findOne(filter);
    let bookmarked;
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      bookmarked = false;
    } else {
      await Bookmark.create(filter);
      bookmarked = true;
    }

    res.json({ bookmarked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// The logged-in user's saved posts
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({ path: 'post', populate: { path: 'author', select: 'name email' } });

    const posts = bookmarks
      .map((b) => b.post)
      .filter((p) => p && p.status === 'published');

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only the author or an admin may do this
    if (!(await canManagePost(post, req.user.userId))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only these fields can be changed (blocks changing author, views, likes...)
    const allowedFields = ['title', 'excerpt', 'content', 'image', 'category', 'tags', 'status'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('author', 'name email').populate('category', 'name');

    res.json({ post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only the author or an admin may do this
    if (!(await canManagePost(post, req.user.userId))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id }); // remove its comments too
    await Like.deleteMany({ post: req.params.id });
    await Bookmark.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Comments routes
app.get('/api/comments/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      author: req.user.userId,
    };

    const comment = new Comment(commentData);
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload routes
app.post('/api/upload/image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
      }
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      // Relative address: works on any port or domain
      url: `/uploads/${req.file.filename}`,
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});