import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// Assuming these Appwrite functions handle file uploads and return URLs/IDs
import { getFilePreview, uploadFile } from "@/lib/appwrite/uploadImage";
import axios from "axios";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({});
  // console.log(formData) // Uncomment for debugging if needed

  const [createPostError, setCreatePostError] = useState(null);
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

  // Function to handle image upload using Appwrite
  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image!");
        toast({ title: "Please select an image!" });
        return;
      }

      setImageUploading(true);
      setImageUploadError(null); // Clear previous errors

      // Upload the file using your Appwrite function
      const uploadedFile = await uploadFile(file);
      // Get the preview URL for the uploaded file

      const postImageUrl = convertAppwritePreviewToView(
        getFilePreview(uploadedFile.$id).href
      );

      // Update formData with the image URL
      setFormData({ ...formData, image: postImageUrl });

      toast({ title: "Image Uploaded Successfully!" });

      // Set uploading to false once image URL is obtained
      if (postImageUrl) {
        setImageUploading(false);
      }
    } catch (error) {
      setImageUploadError("Image upload failed");
      console.error("Image upload error:", error); // Log the actual error
      toast({ title: "Image upload failed!" });
      setImageUploading(false);
    }
  };

  // Function to handle form submission and post creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use axios.post to send the form data
      // Include withCredentials: true to send cookies (like session cookies)
      const res = await axios.post(
        "http://localhost:5000/api/post/create",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // <-- Add this line to send credentials
        }
      );

      const data = res.data;
      console.log("API Response:", res); // Log the full response

      // Check if the request was successful based on axios response status
      if (res.status !== 200 && res.status !== 201) {
        // Check for common success statuses
        // Use the message from the response data if available
        const errorMessage =
          data.message || "Something went wrong! Please try again.";
        toast({ title: errorMessage });
        setCreatePostError(errorMessage);
        return;
      }

      // If successful
      toast({ title: "Article Published Successfully!" });
      setCreatePostError(null); // Clear any previous errors

      // Navigate to the newly created post using the slug from the response
      navigate(`/post/${data.slug}`);
    } catch (error) {
      // Handle network errors or errors from the server (e.g., 400, 500 status codes)
      console.error("Post creation error:", error); // Log the actual error

      // Check if the error has a response with data and message
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong! Please try again.";
      toast({ title: errorMessage });
      setCreatePostError(errorMessage);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Create a post
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            type="text"
            placeholder="Title"
            required
            id="title"
            className="w-full sm:w-3/4 h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="w-full sm:w-1/4 h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="worldnews">World News</SelectItem>
                <SelectItem value="sportsnews">Sports News</SelectItem>
                <SelectItem value="localnews">Local News</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-slate-600 border-dotted p-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <Button
            type="button" // Changed to type="button" as it's not a form submit button
            className="bg-slate-700"
            onClick={handleUploadImage}
            disabled={imageUploading} // Disable button while uploading
          >
            {imageUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        {imageUploadError && <p className="text-red-600">{imageUploadError}</p>}

        {formData.image && (
          <img
            src={formData.image}
            alt="upload preview" // More descriptive alt text
            className="w-full h-72 object-cover"
          />
        )}

        <ReactQuill
          theme="snow"
          placeholder="Write something here..."
          className="h-72  mb-12"
          required
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
          value={formData.content || ""} // Add value prop for controlled component
        />

        <Button
          type="submit"
          className="h-12 bg-green-600 font-semibold max-sm:mt-5 text-md"
          disabled={imageUploading} // Prevent submission while image is uploading
        >
          Publish Your Article
        </Button>

        {createPostError && (
          <p className="text-red-600 mt-5">{createPostError}</p>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
