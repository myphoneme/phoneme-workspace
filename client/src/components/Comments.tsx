import { useState } from 'react';
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';

interface CommentsProps {
  todoId: number;
}

export const Comments = ({ todoId }: CommentsProps) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const { data: comments, isLoading } = useComments(todoId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content) {
      alert('Please enter a comment');
      return;
    }

    createComment.mutate(
      { todoId, content },
      {
        onSuccess: () => {
          setContent('');
        },
      }
    );
  };

  const handleDelete = (commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment.mutate({ id: commentId, todoId });
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading comments...</div>;
  }

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-gray-800 mb-3">Comments</h4>

      <div className="space-y-3 mb-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-blue-600">{comment.authorName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {(comment.authorId === user?.id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No comments yet</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="text-sm text-gray-600 mb-1">
          Commenting as <strong>{user?.name}</strong>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={createComment.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createComment.isPending ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
    </div>
  );
};
