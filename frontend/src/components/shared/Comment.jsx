import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiFillLike } from "react-icons/ai";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import axios from "axios"; // Import axios

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

const Comment = ({ comment, onLike, onEdit, onDelete }) => {
  // State to store the user information for the comment author
  const [user, setUser] = useState({});

  // State to manage editing mode for the comment
  const [isEditing, setIsEditing] = useState(false);
  // State to hold the content being edited
  const [editedContent, setEditedContent] = useState(comment.content);

  // Local loading states for specific actions
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get the current logged-in user from Redux state
  const { currentUser } = useSelector((state) => state.user);

  // Effect hook to fetch the comment author's user details when the component mounts or comment changes
  useEffect(() => {
    const getUser = async () => {
      try {
        // Use axios.get to fetch user details
        const res = await axios.get(
          `http://localhost:5000/api/user/${comment.userId}`,
          {
            withCredentials: true, // <-- Include credentials (cookies)
          }
        );

        const data = res.data; // axios puts the response body in .data

        // Check if the request was successful based on axios response status
        if (res.status === 200) {
          setUser(data); // Set the user state with fetched data
        } else {
          console.error("Failed to fetch user:", data.message);
          // Optionally set an error state or show a toast
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Handle network errors or errors from the server
      }
    };

    getUser(); // Call the fetch function
  }, [comment]); // Dependency array includes comment to refetch if comment object changes

  // Handler to start editing mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content); // Populate the textarea with current comment content
  };

  // Handler to save the edited comment
  const handleSave = async () => {
    setSaving(true); // Set saving loading state

    try {
      // Use axios.put to send the update request
      const res = await axios.put(
        `http://localhost:5000/api/comment/editComment/${comment._id}`,
        {
          content: editedContent, // Send the edited content in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      // Check if the request was successful based on axios response status
      if (res.status === 200) {
        setIsEditing(false); // Exit editing mode
        onEdit(comment, editedContent); // Call the parent's onEdit handler
      } else {
        console.error("Failed to save comment:", res.data.message);
        // Optionally show a toast or set an error state
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      // Handle network errors or errors from the server
    } finally {
      setSaving(false); // Reset saving loading state
    }
  };

  // Handler to delete the comment
  const handleDeleteUser = async () => {
    // Note: Function name is handleDeleteUser, but it deletes a comment
    setDeleting(true); // Set deleting loading state

    try {
      // Use axios.delete to send the delete request
      const res = await axios.delete(
        `http://localhost:5000/api/comment/deleteComment/${comment._id}`,
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      // Check if the request was successful based on axios response status
      if (res.status === 200) {
        onDelete(comment._id); // Call the parent's onDelete handler
      } else {
        console.error("Failed to delete comment:", res.data.message);
        // Optionally show a toast or set an error state
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      // Handle network errors or errors from the server
    } finally {
      setDeleting(false); // Reset deleting loading state
    }
  };

  return (
    <div className="flex p-4 border-b border-slate-300 text-sm gap-2">
      <div className="flex-shrink-0 mr-0">
        {/* Display user's profile picture */}
        <img
          src={
            user.profilePicture ||
            "https://placehold.co/40x40/E2E8F0/4A5568?text=User"
          } // Added placeholder fallback
          alt={user.username || "User"} // Added fallback alt text
          className="w-10 h-10 rounded-full bg-gray-200"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center mb-1">
          {/* Display username and time ago */}
          <span className="font-semibold mr-1 text-sm truncate">
            {user ? `@${user.username}` : "Unknown"}
          </span>
          <span className="text-gray-500 text-sm">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>

        {isEditing ? (
          // Editing mode UI
          <>
            <Textarea
              className="mb-2"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 text-sm">
              <Button
                type="button"
                className="bg-green-600"
                onClick={handleSave}
                disabled={saving} // Disable button while saving
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                className="hover:border-red-500 hover:text-red-500"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={saving} // Disable cancel while saving is in progress
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          // Display mode UI
          <>
            <p className="text-slate-600 pb-2">{comment.content}</p>

            <div className="flex items-center pt-2 text-sm border-t border-slate-300 max-w-fit gap-2">
              {/* Like button */}
              <button
                type="button"
                onClick={() => onLike(comment._id)}
                className={`text-gray-400 hover:text-blue-500 ${
                  currentUser &&
                  comment.likes.includes(currentUser._id) &&
                  "!text-blue-600"
                }`}
              >
                <AiFillLike className="text-lg" />
              </button>

              {/* Number of likes display */}
              <p className="text-gray-400">
                {comment.numberOfLikes > 0 &&
                  comment.numberOfLikes +
                    " " +
                    (comment.numberOfLikes === 1 ? "like" : "likes")}
              </p>

              {/* Edit and Delete buttons (only for comment author or admin) */}
              {currentUser &&
                (currentUser._id === comment.userId || currentUser.isAdmin) && (
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="text-gray-400 hover:text-green-600"
                    >
                      Edit
                    </button>

                    {/* AlertDialog for delete confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        {/* Use a button or span for the trigger */}
                        <span
                          className="text-gray-400 hover:text-red-600 cursor-pointer"
                          disabled={deleting}
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </span>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your comment and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={handleDeleteUser} // This will trigger the delete action
                            disabled={deleting} // Disable action button while deleting
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;
