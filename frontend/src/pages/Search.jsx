import PostCard from "@/components/shared/PostCard";
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
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "",
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");

    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl || "",
        sort: sortFromUrl || "desc", // Default to 'desc' if not in URL
        category: categoryFromUrl || "",
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();

      try {
        // Use axios.get instead of fetch
        const res = await axios.get(
          `http://localhost:5000/api/post/getposts?${searchQuery}`,
          {
            withCredentials: true, // Include cookies
          }
        ); // Axios puts the response data in the 'data' property

        const data = res.data; // Axios throws an error for non-2xx status codes, so no need to check res.ok

        setPosts(data.posts);
        setLoading(false);

        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false); // Ensure loading is set to false on error // Log more details for axios errors
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
  }, [location.search]); // Dependency array includes location.search

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    } // Add handlers for sort and category changes if needed here, // although the Select components handle state updates directly.
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(location.search);

    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);

    const searchQuery = urlParams.toString();

    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);

    urlParams.set("startIndex", startIndex);

    const searchQuery = urlParams.toString();

    try {
      // Use axios.get instead of fetch
      const res = await axios.get(
        `http://localhost:5000/api/post/getposts?${searchQuery}`,
        {
          withCredentials: true, // Include cookies
        }
      ); // Axios puts the response data in the 'data' property

      const data = res.data; // Axios throws an error for non-2xx status codes

      setPosts([...posts, ...data.posts]);

      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
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

  return (
    <div className="flex flex-col md:flex-row">
            {/* Sidebar */}     {" "}
      <aside className="p-6 md:w-1/4 bg-white shadow-md border-r border-gray-300">
               {" "}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                   {" "}
          <h2 className="text-2xl font-semibold text-gray-600">Filters</h2>     
              {/* search input */}         {" "}
          <div className="flex flex-col gap-2">
                       {" "}
            <label className="font-medium text-gray-600">Search Term:</label>   
                   {" "}
            <Input
              placeholder="Search..."
              id="searchTerm"
              type="text"
              className="border-gray-300 rounded-md"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
                     {" "}
          </div>
                    {/* Sort By */}         {" "}
          <div className="flex flex-col gap-2">
                       {" "}
            <label className="font-medium text-gray-600">Sort By:</label>       
               {" "}
            <Select
              onValueChange={(value) =>
                setSidebarData({ ...sidebarData, sort: value })
              }
              value={sidebarData.sort}
            >
                           {" "}
              <SelectTrigger className="w-full border border-slate-400">
                                <SelectValue placeholder="Select Order" />     
                       {" "}
              </SelectTrigger>
                           {" "}
              <SelectContent>
                               {" "}
                <SelectGroup>
                                    <SelectLabel>Order by:</SelectLabel>       
                            <SelectItem value="desc">Latest</SelectItem>       
                            <SelectItem value="asc">Oldest</SelectItem>         
                       {" "}
                </SelectGroup>
                             {" "}
              </SelectContent>
                         {" "}
            </Select>
                     {" "}
          </div>
                    {/* Category */}         {" "}
          <div className="flex flex-col gap-2">
                       {" "}
            <label className="font-medium text-gray-600">Category:</label>     
                 {" "}
            <Select
              onValueChange={(value) =>
                setSidebarData({ ...sidebarData, category: value })
              }
              value={sidebarData.category}
            >
                           {" "}
              <SelectTrigger className="w-full border border-slate-400">
                                <SelectValue placeholder="Select a Category" /> 
                           {" "}
              </SelectTrigger>
                           {" "}
              <SelectContent>
                               {" "}
                <SelectGroup>
                                    <SelectLabel>Category:</SelectLabel>       
                           {" "}
                  <SelectItem value="worldnews">World News</SelectItem>         
                         {" "}
                  <SelectItem value="sportsnews">Sports News</SelectItem>       
                           {" "}
                  <SelectItem value="localnews">Local News</SelectItem>         
                         {" "}
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>{" "}
                  {/* Added uncategorized option */}               {" "}
                </SelectGroup>
                             {" "}
              </SelectContent>
                         {" "}
            </Select>
                     {" "}
          </div>
                    {/* submit button */}         {" "}
          <Button
            type="submit"
            className="bg-red-600 text-white py-2 px-4 rounded-md shadow-lg "
          >
                        Apply Filters          {" "}
          </Button>
                 {" "}
        </form>
             {" "}
      </aside>
           {" "}
      <div className="w-full">
               {" "}
        <h1 className="text-2xl font-semibold text-slate-700 p-3 mt-5">
                    News Articles:        {" "}
        </h1>
                <Separator className="bg-slate-300" />       {" "}
        <div className="p-7 flex flex-wrap gap-4">
                   {" "}
          {!loading && posts.length === 0 && (
            <p className="text-xl text-gray-500">No posts found.</p>
          )}
                   {" "}
          {loading && (
            <p className="text-xl text-gray-500 animate-pulse">Loading...</p>
          )}
                   {" "}
          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
                   {" "}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-slate-800 text-lg hover:underline p-7 w-full"
            >
                            Show More            {" "}
            </button>
          )}
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default Search;
