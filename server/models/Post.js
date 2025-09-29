const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  excerpt: {
    type: String,
    maxlength: 500,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  category: {
    type: String, // can be updated to ObjectId if you add a Category model
    required: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  readTime: {
    type: Number, // in minutes
  },
  publishedAt: {
    type: Date,
  },
  seoTitle: {
    type: String,
    maxlength: 60,
  },
  seoDescription: {
    type: String,
    maxlength: 160,
  },
}, {
  timestamps: true,
});

// Generate slug from title
postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // fixed trim
  }
  next();
});

// Calculate read time
postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Set publishedAt when status changes to published
postSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Indexes for better query performance
postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
postSchema.index({ category: 1, status: 1, createdAt: -1 });
postSchema.index({ author: 1, status: 1, createdAt: -1 });
postSchema.index({ featured: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
