import Advertise from "@/components/shared/Advertise";
import CommentSection from "@/components/shared/CommentSection";
import PostCard from "@/components/shared/PostCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios"; // Import axios

const PostDetails = () => {
  // Get the post slug from the URL parameters
  const { postSlug } = useParams();

  // State for loading, error, the current post, and recent articles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentArticles, setRecentArticles] = useState(null);

  // console.log(recentArticles); // Uncomment for debugging if needed
  // console.log(post); // Uncomment for debugging if needed

  // Effect hook to fetch the specific post details based on the slug
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true); // Set loading state to true

        // Use axios.get to fetch the post by slug
        const res = await axios.get(
          `http://localhost:5000/api/post/getposts?slug=${postSlug}`,
          {
            withCredentials: true, // <-- Include credentials (cookies)
          }
        );

        const data = res.data; // axios puts the response body in .data

        // Check if the request was successful and if posts were returned
        if (res.status !== 200 || !data.posts || data.posts.length === 0) {
          setError(true); // Set error state
          setLoading(false); // Reset loading state
          console.error(
            "Failed to fetch post:",
            data.message || "No post found."
          );
          return;
        }

        // If successful and post found
        setPost(data.posts[0]); // Set the post state with the first result
        setLoading(false); // Reset loading state
        setError(false); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching post:", error); // Log the actual error
        setError(true); // Set error state
        setLoading(false); // Reset loading state
      }
    };

    fetchPost(); // Call the fetch function
  }, [postSlug]); // Dependency array includes postSlug to refetch when the slug changes

  // Effect hook to fetch recent articles
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        // Use axios.get to fetch recent posts (limited to 3)
        const res = await axios.get(
          `http://localhost:5000/api/post/getposts?limit=3`,
          {
            withCredentials: true, // <-- Include credentials (cookies)
          }
        );

        const data = res.data; // axios puts the response body in .data

        // Check if the request was successful and if posts were returned
        if (res.status === 200 && data.posts) {
          setRecentArticles(data.posts); // Set the recent articles state
        } else {
          console.error(
            "Failed to fetch recent posts:",
            data.message || "No recent posts found."
          );
          // Optionally set an error state for recent posts or show a toast
        }
      } catch (error) {
        console.error("Error fetching recent posts:", error); // Log the actual error
        // Handle network errors or errors from the server
      }
    };

    fetchRecentPosts(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs only once on mount

  // Display a loading indicator while the post is being fetched
  if (loading) {
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

  // Display an error message if fetching failed
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 text-xl">
        Could not load the post. Please try again.
      </div>
    );
  }

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      {/* Post Title */}
      <h1 className="text-3xl mt-10 p-3 text-center font-bold max-w-3xl mx-auto lg:text-4xl text-slate-700 underline">
        {post && post.title}
      </h1>

      {/* Category Button */}
      <Link
        to={`/search?category=${post && post.category}`}
        className="self-center mt-5"
      >
        <Button variant="outline" className="border border-slate-500">
          {post && post.category}
        </Button>
      </Link>

      {/* Post Image */}
      <img
        src={post && post.image}
        alt={post && post.title}
        className="mt-10 p-3 max-h-[500px] w-full object-cover"
      />

      {/* Post Info (Date and Read Time) */}
      <div className="flex justify-between p-3 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="italic">
          {post && (post.content.length / 100).toFixed(0)} mins read
        </span>
      </div>

      <Separator className="bg-slate-500" />

      {/* Post Content (rendered as HTML) */}
      <div
        className="p-3 max-w-3xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>

      {/* Advertisement Section */}
      <div className="max-w-4xl mx-auto w-full">
        <Advertise />
      </div>

      {/* Comment Section */}
      {/* Pass post._id to the CommentSection component */}
      {post && <CommentSection postId={post._id} />}

      {/* Recently Published Articles Section */}
      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl font-semibold mt-5 text-slate-700">
          Recently published articles
        </h1>

        {/* Display recent articles using PostCard component */}
        <div className="flex flex-wrap gap-5 my-5 justify-center">
          {recentArticles &&
            recentArticles.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
        </div>
      </div>
    </main>
  );
};

export default PostDetails;
