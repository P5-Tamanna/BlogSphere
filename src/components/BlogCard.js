import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Eye } from 'lucide-react';
import {
  getImageUrl,
  formatReadTime,
  getCategoryColor,
  formatPostDate,
} from '../utils/postHelpers';

const BlogCard = ({ post }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getImageUrl(post.image);

  return (
    <article className="card card-hover group">
      {/* Post Image */}
      <Link to={`/blog/${post._id}`} className="block mb-4 overflow-hidden rounded-lg">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={post.title}
            onError={() => setImageFailed(true)}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {post.title?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </Link>

      {/* Post Content */}
      <div className="space-y-3">
        {/* Category and Meta */}
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
              post.category
            )}`}
          >
            {post.category}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            {post.views || 0}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          <Link to={`/blog/${post._id}`}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>

        {/* Author and Date */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.author?.name || 'Anonymous'}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {formatPostDate(post.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {formatReadTime(post.readTime)}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{String(tag).replace(/^#+/, '')}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;