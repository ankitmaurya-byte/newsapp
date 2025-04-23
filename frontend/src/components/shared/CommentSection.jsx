import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import Comment from "./Comment";
import axios from "axios"; // Import axios

const CommentSection = ({ postId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get the current logged-in user from Redux state
  const { currentUser } = useSelector((state) => state.user);

  // State for the new comment being typed
  const [comment, setComment] = useState("");
  // State for the list of all comments for the post
  const [allComments, setAllComments] = useState([]);

  // Local loading states for specific actions
  const [submittingComment, setSubmittingComment] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(true); // Initial loading state for fetching comments

  // console.log(allComments) // Uncomment for debugging if needed

  // Handler for submitting a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for comment length
    if (comment.length > 200) {
      toast({
        title: "Comment length must be lower than or equal to 200 characters",
      });
      return;
    }

    // If user is not logged in, redirect to sign-in page
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }

    setSubmittingComment(true); // Set submitting loading state

    try {
      // Use axios.post to create a new comment
      const res = await axios.post(
        "http://localhost:5000/api/comment/create",
        {
          content: comment,
          postId,
          userId: currentUser._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status === 200 || res.status === 201) {
        // Check for common success statuses
        toast({ title: "Comment successfully!" });
        setComment(""); // Clear the comment textarea
        setAllComments([data, ...allComments]); // Add the new comment to the beginning of the list
      } else {
        console.error("Failed to submit comment:", data.message);
        toast({
          title: data.message || "Something went wrong! Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting comment:", error); // Log the actual error
      // Handle network errors or errors from the server
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong! Please try again.";
      toast({ title: errorMessage });
    } finally {
      setSubmittingComment(false); // Reset submitting loading state
    }
  };

  // Effect hook to fetch existing comments for the post
  useEffect(() => {
    const getComments = async () => {
      setFetchingComments(true); // Set fetching loading state
      try {
        // Use axios.get to fetch comments for the post
        const res = await axios.get(
          `http://localhost:5000/api/comment/getPostComments/${postId}`,
          {
            withCredentials: true, // <-- Include credentials (cookies)
          }
        );

        const data = res.data; // axios puts the response body in .data

        // Check if the request was successful based on axios response status
        if (res.status === 200) {
          setAllComments(data); // Set the comments state
        } else {
          console.error("Failed to fetch comments:", data.message);
          // Optionally show a toast or set an error state
        }
      } catch (error) {
        console.error("Error fetching comments:", error); // Log the actual error
        // Handle network errors or errors from the server
      } finally {
        setFetchingComments(false); // Reset fetching loading state
      }
    };

    // Only fetch comments if postId is available
    if (postId) {
      getComments(); // Call the fetch function
    }
  }, [postId]); // Dependency array includes postId to refetch comments when the post changes

  // Handler for liking/unliking a comment
  const handleLike = async (commentId) => {
    try {
      // If user is not logged in, redirect to sign-in page
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }

      // Use axios.put to like/unlike the comment
      const res = await axios.put(
        `http://localhost:5000/api/comment/likeComment/${commentId}`,
        {}, // PUT requests often expect a body, even if empty
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status === 200) {
        // Update the comments list with the new like data
        setAllComments(
          allComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : comment
          )
        );
      } else {
        console.error("Failed to like comment:", data.message);
        // Optionally show a toast or set an error state
      }
    } catch (error) {
      console.error("Error liking comment:", error); // Log the actual error
      // Handle network errors or errors from the server
    }
  };

  // Handler for updating a comment after editing (called from Comment component)
  const handleEdit = async (comment, editedContent) => {
    // Update the comments list with the edited content
    setAllComments(
      allComments.map((c) =>
        c._id === comment._id ? { ...c, content: editedContent } : c
      )
    );
    // Note: The actual API call for editing is handled within the Comment component
  };

  // Handler for deleting a comment (called from Comment component)
  const handleDelete = async (commentId) => {
    try {
      // If user is not logged in, redirect to sign-in page
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }

      // Use axios.delete to delete the comment
      const res = await axios.delete(
        `http://localhost:5000/api/comment/deleteComment/${commentId}`,
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status === 200) {
        // Remove the deleted comment from the comments list
        setAllComments(
          allComments.filter((comment) => comment._id !== commentId)
        );
      } else {
        console.error("Failed to delete comment:", data.message);
        // Optionally show a toast or set an error state
      }
    } catch (error) {
      console.error("Error deleting comment:", error); // Log the actual error
      // Handle network errors or errors from the server
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-3">
      {/* Display signed-in user info or sign-in prompt */}
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as:</p>
          <img
            src={
              currentUser.profilePicture ||
              "https://placehold.co/20x20/E2E8F0/4A5568?text=User"
            } // Added placeholder fallback
            alt="Profile Pic"
            className="h-5 w-5 object-cover rounded-full"
          />
          <Link
            to={"/dashboard?tab=profile"}
            className="text-sm text-blue-800 hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-gray-700 my-5 flex gap-1">
          You must be signed in to comment.
          <Link to={"/sign-in"} className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      )}

      {/* Comment submission form (only visible if user is logged in) */}
      {currentUser && (
        <form
          className="border-2 border-gray-400 rounded-md p-4"
          onSubmit={handleSubmit}
        >
          <Textarea
            placeholder="Add a comment..."
            rows="3"
            maxLength="200"
            className="border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
            disabled={submittingComment} // Disable textarea while submitting
          />
          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-sm">
              {200 - comment.length} characters remaining
            </p>
            <Button type="submit" disabled={submittingComment}>
              {submittingComment ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      )}

      {/* Display comments or "No comments yet!" message */}
      {fetchingComments ? (
        <p className="text-sm my-5">Loading comments...</p>
      ) : allComments.length === 0 ? (
        <p className="text-sm my-5">No comments yet!</p>
      ) : (
        <>
          {/* Comments count */}
          <div className="text-sm my-5 flex items-center gap-1 font-semibold">
            <p>Comments</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{allComments.length}</p>
            </div>
          </div>

          {/* List of comments */}
          {allComments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onLike={handleLike} // Pass handleLike to Comment component
              onEdit={handleEdit} // Pass handleEdit to Comment component
              onDelete={handleDelete} // Pass handleDelete to Comment component
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CommentSection;
