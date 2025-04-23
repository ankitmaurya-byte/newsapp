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
import { getFilePreview, uploadFile } from "@/lib/appwrite/uploadImage"; // Assuming these are Appwrite functions
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Import axios

const EditPost = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { postId } = useParams();

  const { currentUser } = useSelector((state) => state.user);

  const [file, setFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false); // Initialize formData as an empty object, will be populated in useEffect

  const [formData, setFormData] = useState({}); // console.log(formData); // Keep for debugging if needed
  const [updatePostError, setUpdatePostError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Use axios.get instead of fetch
        const res = await axios.get(
          `http://localhost:5000/api/post/getposts?postId=${postId}`,
          {
            withCredentials: true, // Include cookies
          }
        ); // Axios puts the response data in the 'data' property

        const data = res.data; // Axios throws an error for non-2xx status codes, so no need to check res.ok

        setUpdatePostError(null); // Assuming the API returns an array of posts and we need the first one
        if (data.posts && data.posts.length > 0) {
          setFormData(data.posts[0]);
        } else {
          // Handle case where post is not found
          setUpdatePostError("Post not found.");
          toast({ title: "Post not found." });
        }
      } catch (error) {
        console.log(error);
        setUpdatePostError("Failed to fetch post data.");
        toast({ title: "Failed to fetch post data." }); // Log more details for axios errors
        if (error.response) {
          console.log("Error response data:", error.response.data);
          console.log("Error response status:", error.response.status);
        } else if (error.request) {
          console.log("Error request:", error.request);
        } else {
          console.log("Error message:", error.message);
        }
      }
    };

    fetchPost();
  }, [postId]); // Dependency array includes postId // Function to convert Appwrite preview URL to view URL

  function convertAppwritePreviewToView(url) {
    if (!url.includes("/preview")) return url; // Replace /preview with /view and strip query params except "project"

    const urlObj = new URL(url);
    urlObj.pathname = urlObj.pathname.replace("/preview", "/view"); // Keep only the "project" query param

    const project = urlObj.searchParams.get("project");
    urlObj.search = project ? `?project=${project}` : "";

    return urlObj.toString();
  }

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image!");
        toast({ title: "Please select an image!" });
        return;
      }

      setImageUploading(true);
      setImageUploadError(null); // Assuming uploadFile and getFilePreview are correctly implemented Appwrite functions

      const uploadedFile = await uploadFile(file);
      const postImageUrl = convertAppwritePreviewToView(
        getFilePreview(uploadedFile.$id).href
      );

      setFormData({ ...formData, image: postImageUrl });

      toast({ title: "Image Uploaded Successfully!" }); // Check if postImageUrl is successfully obtained before setting uploading to false

      if (postImageUrl) {
        setImageUploading(false);
      }
    } catch (error) {
      setImageUploadError("Image upload failed");
      console.log(error);
      toast({ title: "Image upload failed!" });
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // console.log(formData._id); // Keep for debugging if needed

    try {
      // Use axios.put instead of fetch
      const res = await axios.put(
        `/api/post/updatepost/${postId}/${currentUser._id}`,
        formData, // Pass formData directly as the request body
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include cookies
        }
      ); // Axios puts the response data in the 'data' property

      const data = res.data; // Axios throws an error for non-2xx status codes, so no need to check res.ok

      toast({ title: "Article Updated Successfully!" });
      setUpdatePostError(null);
      navigate(`/post/${data.slug}`); // Assuming the response includes the updated post data with slug
    } catch (error) {
      console.log(error);
      toast({ title: "Something went wrong! Please try again." });
      setUpdatePostError("Something went wrong! Please try again."); // Log more details for axios errors
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
      } else if (error.request) {
        console.log("Error request:", error.request);
      } else {
        console.log("Error message:", error.message);
      }
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
           {" "}
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
                Edit post      {" "}
      </h1>
           {" "}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
               {" "}
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
                   {" "}
          <Input
            type="text"
            placeholder="Title"
            required
            id="title"
            className="w-full sm:w-3/4 h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            value={formData.title || ""} // Use empty string as default for controlled input
          />
                   {" "}
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
            value={formData.category || ""} // Use empty string as default for controlled input
          >
                       {" "}
            <SelectTrigger className="w-full sm:w-1/4 h-12 border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="Select a Category" />     
                   {" "}
            </SelectTrigger>
                       {" "}
            <SelectContent>
                           {" "}
              <SelectGroup>
                                <SelectLabel>Category</SelectLabel>             
                  <SelectItem value="worldnews">World News</SelectItem>         
                      <SelectItem value="sportsnews">Sports News</SelectItem>   
                           {" "}
                <SelectItem value="localnews">Local News</SelectItem>           
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>{" "}
                {/* Added uncategorized option */}             {" "}
              </SelectGroup>
                         {" "}
            </SelectContent>
                     {" "}
          </Select>
                 {" "}
        </div>
               {" "}
        <div className="flex gap-4 items-center justify-between border-4 border-slate-600 border-dotted p-3">
                   {" "}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
                   {" "}
          <Button
            type="button"
            className="bg-slate-700"
            onClick={handleUploadImage}
            disabled={imageUploading} // Disable button while uploading
          >
                        {imageUploading ? "Uploading..." : "Upload Image"}     
               {" "}
          </Button>
                 {" "}
        </div>
               {" "}
        {imageUploadError && <p className="text-red-600">{imageUploadError}</p>}
               {" "}
        {formData.image && (
          <img
            src={formData.image}
            alt="Post image preview" // Added alt text for accessibility
            className="w-full h-72 object-cover"
          />
        )}
               {" "}
        <ReactQuill
          theme="snow"
          placeholder="Write something here..."
          className="h-72  mb-12"
          required
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
          value={formData.content || ""} // Use empty string as default for controlled input
        />
               {" "}
        <Button
          type="submit"
          className="h-12 bg-green-600 font-semibold max-sm:mt-5 text-md"
          disabled={imageUploading} // Disable submit button while image is uploading
        >
                    Update Your Article        {" "}
        </Button>
               {" "}
        {updatePostError && (
          <p className="text-red-600 mt-5">{updatePostError}</p>
        )}
             {" "}
      </form>
         {" "}
    </div>
  );
};

export default EditPost;
