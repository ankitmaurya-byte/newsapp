import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardCard from "./DashboardCard";
import { convertToReadableFormat } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import axios from "axios"; // Import axios

const MainDashboard = () => {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use axios.get instead of fetch
        const res = await axios.get(
          "http://localhost:5000/api/user/getusers?limit=5",
          {
            withCredentials: true, // Include cookies
          }
        ); // Axios puts the response data in the 'data' property

        const data = res.data; // Axios throws an error for non-2xx status codes, so no need to check res.ok

        setUsers(data.users);
        setTotalUsers(data.totalUsers);
        setLastMonthUsers(data.lastMonthUsers);
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

    const fetchPosts = async () => {
      try {
        // Use axios.get instead of fetch
        const res = await axios.get(
          "http://localhost:5000/api/post/getposts?limit=5",
          {
            withCredentials: true, // Include cookies
          }
        ); // Axios puts the response data in the 'data' property

        const data = res.data; // Axios throws an error for non-2xx status codes

        setPosts(data.posts);
        setTotalPosts(data.totalPosts);
        setLastMonthPosts(data.lastMonthPosts);
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

    const fetchComments = async () => {
      try {
        // Use axios.get instead of fetch
        const res = await axios.get(
          "http://localhost:5000/api/comment/getcomments?limit=5",
          {
            withCredentials: true, // Include cookies
          }
        ); // Axios puts the response data in the 'data' property

        const data = res.data; // Axios throws an error for non-2xx status codes

        setComments(data.comments);
        setTotalComments(data.totalComments);
        setLastMonthComments(data.lastMonthComments);
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

    if (currentUser.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchComments();
    }
  }, [currentUser]); // Added currentUser to the dependency array

  return (
    <div className="p-3 md:mx-auto">
           {" "}
      <div className="flex-wrap flex gap-4 justify-center">
               {" "}
        <DashboardCard
          title="All Users"
          description={`${convertToReadableFormat(
            currentUser.createdAt
          )} - ${convertToReadableFormat(Date.now())}`}
          chartData={[{ value: totalUsers, fill: "blue" }]}
          chartConfig={{
            users: { label: "Users" },
          }}
          totalValue={totalUsers}
          lastMonthValue={lastMonthUsers}
          footerText={"Showing total users for all time"}
          endAngle={250}
        />
               {" "}
        <DashboardCard
          title="All Comments"
          description={`${convertToReadableFormat(
            currentUser.createdAt
          )} - ${convertToReadableFormat(Date.now())}`}
          chartData={[{ value: totalComments, fill: "orange" }]} // Corrected chartData value
          chartConfig={{
            comments: { label: "Comments" }, // Corrected chartConfig label
          }}
          totalValue={totalComments}
          lastMonthValue={lastMonthComments}
          footerText={"Showing total comments for all time"}
          endAngle={160}
        />
               {" "}
        <DashboardCard
          title="All Posts"
          description={`${convertToReadableFormat(
            currentUser.createdAt
          )} - ${convertToReadableFormat(Date.now())}`}
          chartData={[{ value: totalPosts, fill: "green" }]} // Corrected chartData value
          chartConfig={{
            posts: { label: "Posts" }, // Corrected chartConfig label
          }}
          totalValue={totalPosts}
          lastMonthValue={lastMonthPosts}
          footerText={"Showing total posts for all time"}
          endAngle={110}
        />
             {" "}
      </div>
           {" "}
      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
               {" "}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md">
                   {" "}
          <div className="flex justify-between items-center p-3 text-sm font-semibold">
                       {" "}
            <h1 className="text-center p-2 text-xl font-bold text-slate-700">
                            Recent Users            {" "}
            </h1>
                       {" "}
            <Button>
                            <Link to={"/dashboard?tab=users"}>See all</Link>   
                     {" "}
            </Button>
                     {" "}
          </div>
                   {" "}
          <Table>
                       {" "}
            <TableCaption>A list of your recent users.</TableCaption>           {" "}
            <TableHeader>
                           {" "}
              <TableRow>
                                <TableHead>User image</TableHead>               {" "}
                <TableHead>Username</TableHead>             {" "}
              </TableRow>
                         {" "}
            </TableHeader>
                       {" "}
            {users.map((user) => (
              <TableBody className="divide-y" key={user._id}>
                               {" "}
                <TableRow>
                                   {" "}
                  <TableCell>
                                       {" "}
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-10 h-10 object-cover bg-gray-200 rounded-full"
                    />
                                     {" "}
                  </TableCell>
                                   {" "}
                  <TableCell className="w-32">{user.username}</TableCell>       
                         {" "}
                </TableRow>
                             {" "}
              </TableBody>
            ))}
                     {" "}
          </Table>
                 {" "}
        </div>
               {" "}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md">
                   {" "}
          <div className="flex justify-between items-center p-3 text-sm font-semibold">
                       {" "}
            <h1 className="text-center p-2 text-xl font-bold text-slate-700">
                            Recent Comments            {" "}
            </h1>
                       {" "}
            <Button>
                            <Link to={"/dashboard?tab=comments"}>See all</Link> 
                       {" "}
            </Button>
                     {" "}
          </div>
                   {" "}
          <Table>
                       {" "}
            <TableCaption>A list of your recent comments.</TableCaption>       
               {" "}
            <TableHeader>
                           {" "}
              <TableRow>
                                <TableHead>Comments</TableHead>               {" "}
                <TableHead>Likes</TableHead>             {" "}
              </TableRow>
                         {" "}
            </TableHeader>
                       {" "}
            {comments &&
              comments.map((comment) => (
                <TableBody className="divide-y" key={comment._id}>
                                   {" "}
                  <TableRow>
                                       {" "}
                    <TableCell className="w-96">
                                           {" "}
                      <p className="line-clamp-2">{comment.content}</p>         
                               {" "}
                    </TableCell>
                                       {" "}
                    <TableCell>{comment.numberOfLikes}</TableCell>             
                       {" "}
                  </TableRow>
                               {" "}
                </TableBody>
              ))}
                     {" "}
          </Table>
                 {" "}
        </div>
               {" "}
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md">
                   {" "}
          <div className="flex justify-between items-center p-3 text-sm font-semibold">
                       {" "}
            <h1 className="text-center p-2 text-xl font-bold text-slate-700">
                            Recent Posts            {" "}
            </h1>
                       {" "}
            <Button>
                            <Link to={"/dashboard?tab=posts"}>See all</Link>   
                     {" "}
            </Button>
                     {" "}
          </div>
                   {" "}
          <Table>
                       {" "}
            <TableCaption>A list of your recent posts.</TableCaption>           {" "}
            <TableHeader>
                           {" "}
              <TableRow>
                                <TableHead>Post image</TableHead>               {" "}
                <TableHead>Post Title</TableHead>               {" "}
                <TableHead>Category</TableHead>             {" "}
              </TableRow>
                         {" "}
            </TableHeader>
                       {" "}
            {posts &&
              posts.map((post) => (
                <TableBody className="divide-y" key={post._id}>
                                   {" "}
                  <TableRow>
                                       {" "}
                    <TableCell>
                                           {" "}
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-10 h-10 object-cover bg-gray-200 rounded-full"
                      />
                                         {" "}
                    </TableCell>
                                       {" "}
                    <TableCell className="w-80">{post.title}</TableCell>       
                               {" "}
                    <TableCell className="w-5">{post.category}</TableCell>     
                               {" "}
                  </TableRow>
                               {" "}
                </TableBody>
              ))}
                     {" "}
          </Table>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default MainDashboard;
