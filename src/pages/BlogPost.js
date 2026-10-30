import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Edit3,
  Trash2,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getImageUrl,
  formatReadTime,
  getCategoryColor,
  formatPostDate,
} from '../utils/postHelpers';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery(
    ['post', id],
    () => postsAPI.getById(id),
    {
      select: (response) => response.data.post || response.data,
    }
  );

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const addCommentMutation = useMutation(
    (content) => postsAPI.addComment(id, { content }),
    {
      onSuccess: () => {
        setCommentText('');
        queryClient.invalidateQueries(['post', id]);
        toast.success('Comment added!');
      },
      onError: (error) => {
        const status = error.response?.status;
        toast.error(
          error.response?.data?.message ||
            (status === 404
              ? 'Comment route not found on the server (404)'
              : status === 401
              ? 'Please log in again'
              : 'Failed to post comment')
        );
      },
    }
  );

  const deletePostMutation = useMutation(() => postsAPI.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
      queryClient.invalidateQueries('dashboard-posts');
      toast.success('Post deleted');
      navigate('/blog');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });

  // Updates the saved post data right away (no reload needed)
  const updatePostCache = (changes) => {
    queryClient.setQueryData(['post', id], (old) =>
      old?.data?.post
        ? { ...old, data: { ...old.data, post: { ...old.data.post, ...changes } } }
        : old
    );
  };

  const likeMutation = useMutation(() => postsAPI.toggleLike(id), {
    onSuccess: (res) => updatePostCache({ liked: res.data.liked, likes: res.data.likes }),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not update like');
    },
  });

  const bookmarkMutation = useMutation(() => postsAPI.toggleBookmark(id), {
    onSuccess: (res) => {
      updatePostCache({ bookmarked: res.data.bookmarked });
      queryClient.invalidateQueries('saved-posts');
      toast.success(res.data.bookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not update bookmark');
    },
  });

  const requireLogin = (action) => {
    if (!user) {
      toast.error(`Please log in to ${action}`);
      return false;
    }
    return true;
  };

  const handleDeletePost = () => {
    if (window.confirm('Delete this post? This cannot be undone.')) {
      deletePostMutation.mutate();
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/blog')} className="btn btn-primary">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(post.image);
  const isOwner =
    !!user &&
    (String(post.author?._id) === String(user._id) || user.role === 'admin');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const content = commentText.trim();
    if (!content) {
      toast.error('Please write a comment first');
      return;
    }
    addCommentMutation.mutate(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </button>

        {/* Post Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {imageUrl && (
            <div>
              <img
                src={imageUrl}
                alt={post.title}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Meta Information */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                    post.category
                  )}`}
                >
                  {post.category}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatPostDate(post.createdAt, 'MMMM dd, yyyy')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatReadTime(post.readTime)}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {post.views || 0}
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {post.likes || 0}
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments?.length || 0}
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.author?.name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {post.author?.bio || 'Blog author'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isOwner && (
                  <>
                    <Link
                      to={`/edit-post/${post._id}`}
                      title="Edit post"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleDeletePost}
                      disabled={deletePostMutation.isLoading}
                      title="Delete post"
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => requireLogin('like posts') && likeMutation.mutate()}
                  disabled={likeMutation.isLoading}
                  title={post.liked ? 'Unlike' : 'Like'}
                  className={`p-2 transition-colors ${
                    post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => requireLogin('save posts') && bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isLoading}
                  title={post.bookmarked ? 'Remove bookmark' : 'Save post'}
                  className={`p-2 transition-colors ${
                    post.bookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${post.bookmarked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      #{String(tag).replace(/^#+/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
          <div className="space-y-6">
            {/* Comment Form */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h4>
              {user ? (
                <form className="space-y-4" onSubmit={handleCommentSubmit}>
                  <div>
                    <textarea
                      rows={4}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your comment here..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addCommentMutation.isLoading}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              ) : (
                <p className="text-gray-600">
                  Please{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    log in
                  </Link>{' '}
                  to leave a comment.
                </p>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-semibold text-gray-900">
                            {comment.author?.name || 'Anonymous'}
                          </h5>
                          <span className="text-sm text-gray-500">
                            {formatPostDate(comment.createdAt, 'MMMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;