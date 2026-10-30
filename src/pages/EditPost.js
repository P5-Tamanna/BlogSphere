import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postsAPI, categoriesAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { getImageUrl } from '../utils/postHelpers';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'indent',
  'align', 'link', 'image', 'video', 'blockquote', 'code-block',
];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null); // saved path/URL from the server
  const [isPreview, setIsPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch post data
  const { data: postData, isLoading: postLoading } = useQuery(
    ['post', id],
    () => postsAPI.getById(id),
    {
      select: (response) => response.data.post || response.data,
    }
  );

  // Fill the form once the post has loaded (works even when the data is cached)
  useEffect(() => {
    if (!postData) return;
    reset({
      title: postData.title || '',
      excerpt: postData.excerpt || '',
      category: postData.category || '',
      tags: postData.tags?.join(', ') || '',
      status: postData.status || 'draft',
    });
    setContent(postData.content || '');
    setFeaturedImage(postData.image || null);
  }, [postData?._id]);

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    () => categoriesAPI.getAll(),
    {
      select: (response) => response.data.categories,
    }
  );

  // Update post mutation
  const updatePostMutation = useMutation(
    (payload) => postsAPI.update(id, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-posts');
        queryClient.invalidateQueries('posts');
        queryClient.invalidateQueries(['post', id]);
        toast.success('Post updated successfully!');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update post');
      },
    }
  );

  // Upload image mutation
  const uploadImageMutation = useMutation(
    (formData) => uploadAPI.uploadImage(formData),
    {
      onSuccess: (response) => {
        setFeaturedImage(response.data.url);
        toast.success('Image uploaded successfully!');
      },
      onError: () => {
        toast.error('Failed to upload image');
      },
    }
  );

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      uploadImageMutation.mutate(formData);
    }
  };

  // forcedStatus is used by the "Save as Draft" button
  const submitPost = (data, forcedStatus) => {
    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please add some content to your post');
      return;
    }

    updatePostMutation.mutate({
      ...data,
      status: forcedStatus || data.status,
      content,
      image: featuredImage,
      tags: (data.tags || '')
        .split(',')
        .map((tag) => tag.trim().replace(/^#+/, ''))
        .filter((tag) => tag),
    });
  };

  const handleUpdate = handleSubmit((data) => submitPost(data));
  const handleSaveDraft = handleSubmit((data) => submitPost(data, 'draft'));

  if (postLoading) {
    return <LoadingSpinner />;
  }

  if (!postData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-4">
            The post you're trying to edit doesn't exist.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isSaving = updatePostMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your post title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  {...register('excerpt')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your post"
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories?.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas (no #)"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="space-y-4">
                  {featuredImage ? (
                    <div className="relative">
                      <img
                        src={getImageUrl(featuredImage)}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage(null)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        {uploadImageMutation.isLoading
                          ? 'Uploading...'
                          : 'Upload a featured image'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="btn btn-outline cursor-pointer">
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Content *</label>
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreview ? 'Edit' : 'Preview'}
              </button>
            </div>

            {isPreview ? (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write your post content here..."
                className="min-h-[400px]"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="btn btn-secondary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn btn-primary">
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="spinner h-4 w-4 mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;