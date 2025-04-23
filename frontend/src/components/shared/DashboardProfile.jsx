import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutSuccess,
  updateFailure,
  updateStart,
  updateSuccess,
} from "@/redux/user/userSlice";
// Assuming these Appwrite functions handle file uploads and return URLs/IDs
import { getFilePreview, uploadFile } from "@/lib/appwrite/uploadImage";
import { useToast } from "@/hooks/use-toast";
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
import axios from "axios"; // Import axios

const DashboardProfile = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user);

  const profilePicRef = useRef();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false); // Local loading state for update
  const [deleteLoading, setDeleteLoading] = useState(false); // Local loading state for delete
  const [signoutLoading, setSignoutLoading] = useState(false); // Local loading state for signout

  // console.log(formData) // Uncomment for debugging if needed
  function convertAppwritePreviewToView(url) {
    if (!url.includes("/preview")) return url;

    // Replace /preview with /view and strip query params except "project"
    const urlObj = new URL(url);
    urlObj.pathname = urlObj.pathname.replace("/preview", "/view");

    // Keep only the "project" query param
    const project = urlObj.searchParams.get("project");
    urlObj.search = project ? `?project=${project}` : "";

    return urlObj.toString();
  }
  // Handles file selection for profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  // Handles changes in input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Uploads image using Appwrite and returns the URL
  const uploadImage = async () => {
    // If no new file is selected, return the current profile picture URL
    if (!imageFile) return currentUser.profilePicture;

    try {
      // Upload the file using your Appwrite function
      const uploadedFile = await uploadFile(imageFile);
      // Get the preview URL for the uploaded file ID
      const profilePictureUrl = convertAppwritePreviewToView(
        getFilePreview(uploadedFile.$id).href
      );

      return profilePictureUrl;
    } catch (error) {
      toast({ title: "Image upload failed. Please try again!" });
      console.error("Image upload failed: ", error);
      // Return current picture URL or null if upload fails
      return currentUser.profilePicture;
    }
  };

  // Handles profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateStart()); // Dispatch Redux action
      setUpdateLoading(true); // Set local loading state

      // Wait for image upload to complete and get the URL
      const profilePicture = await uploadImage();

      // Prepare the update data
      const updateProfile = {
        ...formData,
        profilePicture,
      };

      // Use axios for the PUT request
      const res = await axios.put(
        `http://localhost:5000/api/user/update/${currentUser._id}`,
        updateProfile, // Data goes directly as the second argument
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status !== 200) {
        // Use the message from the response data if available
        const errorMessage =
          data.message || "Update user failed. Please try again.";
        toast({ title: errorMessage });
        dispatch(updateFailure(errorMessage));
      } else {
        console.log("User updated successfully:", data);
        dispatch(updateSuccess(data)); // Dispatch Redux action with updated user data
        toast({ title: "User updated successfully." });
      }
    } catch (error) {
      console.error("Update user error:", error); // Log the actual error
      // Handle network errors or errors from the server
      const errorMessage =
        error.response?.data?.message ||
        "Update user failed. Please try again.";
      toast({ title: errorMessage });
      dispatch(updateFailure(errorMessage));
    } finally {
      setUpdateLoading(false); // Reset local loading state
    }
  };

  // Handles user deletion
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart()); // Dispatch Redux action
      setDeleteLoading(true); // Set local loading state

      // Use axios for the DELETE request
      const res = await axios.delete(
        `http://localhost:5000/api/user/delete/${currentUser._id}`,
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status !== 200) {
        const errorMessage =
          data.message || "Delete user failed. Please try again.";
        dispatch(deleteUserFailure(errorMessage));
        toast({ title: errorMessage }); // Show toast on failure
      } else {
        dispatch(deleteUserSuccess()); // Dispatch Redux action
        toast({ title: "Account deleted successfully." }); // Show toast on success
      }
    } catch (error) {
      console.error("Delete user error:", error); // Log the actual error
      // Handle network errors or errors from the server
      const errorMessage =
        error.response?.data?.message ||
        "Delete user failed. Please try again.";
      dispatch(deleteUserFailure(errorMessage));
      toast({ title: errorMessage }); // Show toast on error
    } finally {
      setDeleteLoading(false); // Reset local loading state
    }
  };

  // Handles user sign out
  const handleSignout = async () => {
    try {
      setSignoutLoading(true); // Set local loading state

      // Use axios for the POST request
      const res = await axios.post(
        "http://localhost:5000/api/user/signout",
        {}, // POST requests often expect a body, even if empty
        {
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status !== 200) {
        console.error("Sign out failed:", data.message);
        toast({ title: data.message || "Sign out failed. Please try again." });
        // Depending on your Redux setup, you might dispatch a failure action here
      } else {
        dispatch(signOutSuccess()); // Dispatch Redux action
        toast({ title: "Signed out successfully." }); // Show toast on success
      }
    } catch (error) {
      console.error("Sign out error:", error); // Log the actual error
      // Handle network errors or errors from the server
      const errorMessage =
        error.response?.data?.message || "Sign out failed. Please try again.";
      toast({ title: errorMessage });
      // Depending on your Redux setup, you might dispatch a failure action here
    } finally {
      setSignoutLoading(false); // Reset local loading state
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">
        Update Your Profile
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          hidden
          ref={profilePicRef}
          onChange={handleImageChange}
        />

        {/* Profile picture display, clickable to open file input */}
        <div className="w-32 h-32 self-center cursor-pointer overflow-hidden">
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="Profile" // Descriptive alt text
            className="rounded-full w-full h-full object-cover border-8 border-gray-300"
            onClick={() => profilePicRef.current.click()}
          />
        </div>

        {/* Username Input */}
        <Input
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          className="h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={handleChange}
        />

        {/* Email Input */}
        <Input
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={handleChange}
        />

        {/* Password Input */}
        <Input
          type="password"
          id="password"
          placeholder="password"
          className="h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={handleChange}
        />

        {/* Update Profile Button */}
        <Button
          type="submit"
          className="h-12 bg-green-600"
          disabled={updateLoading || loading}
        >
          {updateLoading ? "Loading..." : "Update Profile"}
        </Button>
      </form>

      {/* Delete Account and Sign Out Buttons */}
      <div className="text-red-500 flex justify-between mt-5 ">
        {/* Delete Account AlertDialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="cursor-pointer"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={handleSignout}
          disabled={signoutLoading}
        >
          {signoutLoading ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>

      {/* Display Redux error state */}
      {error && <p className="text-red-600 mt-5">{error}</p>}
    </div>
  );
};

export default DashboardProfile;
