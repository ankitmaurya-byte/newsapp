import Advertise from "@/components/shared/Advertise";
import PostCard from "@/components/shared/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Use axios.get instead of fetch
        const res = await axios.get(
          "http://localhost:5000/api/post/getPosts?limit=6",
          {
            withCredentials: true, // Include cookies
          }
        ); // Axios puts the response data in the 'data' property

        const data = res.data; // Axios throws an error for non-2xx status codes, so no need to check res.ok

        setPosts(data.posts);
      } catch (error) {
        console.log(error); // Log more details for axios errors
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

    fetchPosts();
  }, []); // Dependency array is empty, so this runs once on mount

  return (
    <div>
           {" "}
      <div className="flex flex-col gap-6 p-28 max-w-6xl mx-auto">
               {" "}
        <h1 className="text-4xl font-bold text-blue-800">
                    Welcome to{" "}
          <span className="text-red-600"> Morning Dispatch</span>       {" "}
        </h1>
               {" "}
        <p className="text-gray-600 mt-3 text-lg">
                    Your trusted source for the latest headlines, in-depth
          analysis, and           breaking news every morning.        {" "}
        </p>
               {" "}
        <p className="text-gray-500 mt-1 italic">Stay informed, stay ahead.</p> 
             {" "}
        <Link to={"/search"}>
                   {" "}
          <Button className="bg-yellow-400 hover:bg-yellow-600 text-black py-3 px-6 rounded-full font-semibold shadow-lg flex items-center gap-2 w-fit">
                        View all posts <ArrowRight className="h-5 w-5" />       
             {" "}
          </Button>
                 {" "}
        </Link>
             {" "}
      </div>
           {" "}
      <section className="pb-16 bg-white">
               {" "}
        <div className="max-w-7xl mx-auto text-center">
                   {" "}
          <h2 className="text-4xl font-bold mb-8 text-gray-800">
                        Why You'll Love Morning Dispatch          {" "}
          </h2>
                   {" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {" "}
            <FeatureCard
              title={"Diverse Content"}
              description={
                "Explore news on a variety of topics, from technology to lifestyle."
              }
              icon="📚"
            />
                       {" "}
            <FeatureCard
              title={"Community Driven"}
              description={
                "Connect with writers and readers who share your interests."
              }
              icon="🌐"
            />
                       {" "}
            <FeatureCard
              title={"Easy to Use"}
              description={
                "A seamless platform for sharing and discovering great content."
              }
              icon="🚀"
            />
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </section>
           {" "}
      <div className="p-3 bg-white">
                <Advertise />     {" "}
      </div>
           {" "}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
               {" "}
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6">
                       {" "}
            <h2 className="text-2xl font-bold text-slate-700">Recent Posts</h2> 
                     {" "}
            <div className="flex flex-wrap gap-4">
                           {" "}
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
                         {" "}
            </div>
                       {" "}
            <Link
              to={"/search"}
              className="text-lg hover:underline text-center font-semibold"
            >
                            View all news            {" "}
            </Link>
                     {" "}
          </div>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
            <div className="text-5xl mb-4">{icon}</div>     {" "}
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>   
        <p className="text-gray-600">{description}</p>   {" "}
    </div>
  );
};

export default Home;
