const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [
  { name: 'Technology', description: 'Latest tech news, tutorials, and insights', color: '#3B82F6', slug: 'technology' },
  { name: 'Lifestyle', description: 'Life tips, wellness, and personal development', color: '#10B981', slug: 'lifestyle' },
  { name: 'Travel', description: 'Travel guides, destinations, and experiences', color: '#8B5CF6', slug: 'travel' },
  { name: 'Food', description: 'Recipes, restaurant reviews, and culinary adventures', color: '#F59E0B', slug: 'food' },
  { name: 'Business', description: 'Entrepreneurship, marketing, and business insights', color: '#6B7280', slug: 'business' },
  { name: 'Health', description: 'Fitness, nutrition, and wellness topics', color: '#EF4444', slug: 'health' },
  { name: 'Education', description: 'Learning resources and educational content', color: '#06B6D4', slug: 'education' },
  { name: 'Entertainment', description: 'Movies, music, books, and entertainment', color: '#EC4899', slug: 'entertainment' }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogplatform');
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('Seeded categories successfully');

    // Display created categories
    const createdCategories = await Category.find();
    console.log('Created categories:', createdCategories.map(c => c.name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
