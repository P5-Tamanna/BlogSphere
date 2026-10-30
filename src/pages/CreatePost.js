import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { postsAPI, categoriesAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      category: '',
      tags: '',
    },
  });

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    () => categoriesAPI.getAll(),
    {
      select: (response) => response.data.categories,
    }
  );

  // Preview URL for the chosen image (created once, cleaned up afterwards)
  const previewUrl = useMemo(
    () => (featuredImage ? URL.createObjectURL(featuredImage) : null),
    [featuredImage]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle image selection
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
      setFeaturedImage(file);
    }
  };

  // status is passed in directly ("draft" or "published")
  const submitPost = async (data, status) => {
    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please add some content to your post');
      return;
    }

    setIsPublishing(true);
    try {
      // Step 1: upload the picture first (same route the Edit page uses)
      let imageUrl = null;
      if (featuredImage instanceof File) {
        const imageData = new FormData();
        imageData.append('image', featuredImage);
        const uploadRes = await uploadAPI.uploadImage(imageData);
        const d = uploadRes.data || {};
        imageUrl =
          d.url || d.imageUrl || d.path || d.image || d.file?.url || d.file?.path || null;
        if (!imageUrl) {
          console.log('Upload response (no image address found):', uploadRes.data);
          toast.error('Image uploaded but the server sent no address. Check the console.');
        }
      }

      // Step 2: save the post with the image address
      const createRes = await postsAPI.create({
        title: data.title,
        excerpt: data.excerpt || '',
        category: data.category,
        status,
        content,
        image: imageUrl,
        tags: (data.tags || '')
          .split(',')
          .map((tag) => tag.trim().replace(/^#+/, ''))
          .filter((tag) => tag),
      });

      // Some servers ignore the image on create, so attach it with the update route
      const created = createRes?.data?.post || createRes?.data || {};
      const newId = created._id || created.id;
      if (imageUrl && newId && !created.image) {
        try {
          await postsAPI.update(newId, { image: imageUrl });
        } catch (err) {
          toast.error('Post saved, but the image could not be attached. Add it from Edit.');
        }
      }

      toast.success(
        status === 'published' ? 'Post published successfully!' : 'Draft saved!'
      );
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => submitPost(data, 'draft'));
  const handlePublish = handleSubmit((data) => submitPost(data, 'published'));

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        </div>

        {/* Pressing Enter in a field publishes nothing by accident: it saves a draft */}
        <form onSubmit={handleSaveDraft} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
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

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
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
                    <p className="text-gray-600 mb-2">Upload a featured image</p>
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

            {/* Content Editor */}
            <div>
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isPublishing}
                className="btn btn-secondary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
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
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="btn btn-primary"
              >
                {isPublishing ? (
                  <div className="flex items-center">
                    <div className="spinner h-4 w-4 mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Publish Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;