import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import axios from "axios"; // Import axios
import { Button } from "../ui/button"; // Import Button if not already

const DashboardComments = () => {
  // Get current user from Redux state
  const { currentUser } = useSelector((state) => state.user);

  // State for storing comments
  const [comments, setComments] = useState([]);

  // State to control visibility of "Show More" button
  const [showMore, setShowMore] = useState(true);

  // State to store the ID of the comment to be deleted
  const [commentIdToDelete, setCommentIdToDelete] = useState("");

  // Local loading states
  const [loadingComments, setLoadingComments] = useState(true); // Initial loading state
  const [loadingMoreComments, setLoadingMoreComments] = useState(false); // Loading state for "Show More"
  const [deletingComment, setDeletingComment] = useState(false); // Loading state for deleting a comment

  // Effect hook to fetch comments when the component mounts or currentUser changes
  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true); // Set initial loading state
      try {
        // Use axios.get to fetch comments
        const res = await axios.get(
          `http://localhost:5000/api/comment/getcomments`,
          {
            withCredentials: true, // <-- Include credentials (cookies)
          }
        );

        const data = res.data; // axios puts the response body in .data

        // Check if the request was successful based on axios response status
        if (res.status === 200) {
          setComments(data.comments); // Set the comments state

          // Determine if "Show More" button should be shown
          if (data.comments.length < 9) {
            setShowMore(false);
          }
        } else {
          console.error("Failed to fetch comments:", data.message);
          // Optionally set an error state or show a toast
        }
      } catch (error) {
        console.error("Error fetching comments:", error); // Log the actual error
        // Handle network errors or errors from the server
      } finally {
        setLoadingComments(false); // Reset loading state
      }
    };

    // Only fetch comments if the current user is an admin
    if (currentUser && currentUser.isAdmin) {
      fetchComments();
    }
  }, [currentUser]); // Dependency array includes currentUser to refetch if admin status changes

  // Handler for fetching more comments when "Show More" is clicked
  const handleShowMore = async () => {
    const startIndex = comments.length; // Calculate the starting index for the next batch

    setLoadingMoreComments(true); // Set loading state for "Show More"

    try {
      // Use axios.get to fetch more comments
      const res = await axios.get(
        `http://localhost:5000/api/comment/getcomments?startIndex=${startIndex}`,
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status === 200) {
        // Append the new comments to the existing list
        setComments((prev) => [...prev, ...data.comments]);

        // Determine if "Show More" button should still be shown
        if (data.comments.length < 9) {
          setShowMore(false);
        }
      } else {
        console.error("Failed to fetch more comments:", data.message);
        // Optionally show a toast or set an error state
      }
    } catch (error) {
      console.error("Error fetching more comments:", error); // Log the actual error
      // Handle network errors or errors from the server
    } finally {
      setLoadingMoreComments(false); // Reset loading state for "Show More"
    }
  };

  // Handler for deleting a comment
  const handleDeleteComment = async () => {
    setDeletingComment(true); // Set deleting loading state

    try {
      // Use axios.delete to delete the comment
      const res = await axios.delete(
        `http://localhost:5000/api/comment/deleteComment/${commentIdToDelete}`,
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status === 200) {
        // Remove the deleted comment from the comments list
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
        // Clear the commentIdToDelete state
        setCommentIdToDelete("");
      } else {
        console.error("Failed to delete comment:", data.message);
        // Optionally show a toast or set an error state
      }
    } catch (error) {
      console.error("Error deleting comment:", error); // Log the actual error
      // Handle network errors or errors from the server
    } finally {
      setDeletingComment(false); // Reset deleting loading state
    }
  };

  // Display loading indicator while comments are initially fetched
  if (loadingComments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <img
          src="https://cdn-icons-png.flaticon.com/128/39/39979.png"
          alt="loading"
          className="w-20 animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-3 overflow-x-auto">
      {" "}
      {/* Added overflow-x-auto for responsiveness */}
      {/* Only show the table if the user is admin and there are comments */}
      {currentUser && currentUser.isAdmin && comments.length > 0 ? (
        <>
          <Table className="min-w-full divide-y divide-gray-200">
            {" "}
            {/* Added min-w-full and divide */}
            <TableCaption>A list of recent comments.</TableCaption>{" "}
            {/* Changed caption slightly */}
            <TableHeader className="bg-gray-50">
              {" "}
              {/* Added background color */}
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Updated
                </TableHead>{" "}
                {/* Added padding and styling */}
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number of Likes
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PostId
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UserId
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {" "}
              {/* Added background color and divide */}
              {comments.map((comment) => (
                <TableRow key={comment._id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {" "}
                    {/* Added padding and styling */}
                    {new Date(comment.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {comment.content}
                  </TableCell>{" "}
                  {/* Added max-w-xs and truncate */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comment.numberOfLikes}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comment.postId}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comment.userId}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        {/* Use a button or span for the trigger */}
                        <Button
                          variant="ghost" // Using ghost variant for a link-like appearance
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setCommentIdToDelete(comment._id);
                          }}
                          disabled={deletingComment} // Disable trigger while deleting
                        >
                          {deletingComment && commentIdToDelete === comment._id
                            ? "Deleting..."
                            : "Delete"}{" "}
                          {/* Show specific deleting state */}
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this comment and remove its data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletingComment}>
                            Cancel
                          </AlertDialogCancel>{" "}
                          {/* Disable cancel while deleting */}
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700" // Added hover effect
                            onClick={handleDeleteComment} // This will trigger the delete action
                            disabled={deletingComment} // Disable action button while deleting
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Show More Button */}
          {showMore && (
            <Button
              onClick={handleShowMore}
              className="w-full text-blue-700 self-center text-sm py-7 mt-5" // Added margin top
              variant="link" // Use link variant
              disabled={loadingMoreComments} // Disable while loading more
            >
              {loadingMoreComments ? "Loading..." : "Show more"}
            </Button>
          )}
        </>
      ) : (
        // Message displayed if user is not admin or no comments found
        <p className="text-center text-gray-700 text-lg">
          {currentUser && !currentUser.isAdmin
            ? "You are not authorized to view this page."
            : "No comments found."}
        </p>
      )}
    </div>
  );
};

export default DashboardComments;
