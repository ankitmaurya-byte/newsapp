import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutSuccess } from "@/redux/user/userSlice";

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  // Keep the original navigate function if needed elsewhere,
  // but for the profile link within the dropdown, we'll handle it in onSelect
  const handlenavigateprofile = () => {
    navigate("/dashboard?tab=profile");
  };

  return (
    <header className="shadow-lg sticky">
      <div className="flex justify-between items-center max-w-6xl lg:max-w-7xl mx-auto p-4">
        <Link to={"/"}>
          <h1 className="font-bold text-xl sm:text-2xl flex flex-wrap">
            <span className="text-slate-500">Morning</span>
            <span className="text-slate-900">Dispatch</span>
          </h1>
        </Link>

        <form
          className="p-3 bg-slate-100 rounded-lg flex items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Search..."
            className="focus:outline-none bg-transparent w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            {" "}
            {/* Added type="submit" */}
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        <ul className="flex gap-4">
          <Link to={"/"}>
            <li className="hidden lg:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>
          <Link to={"/about"}>
            <li className="hidden lg:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>
          <Link to={"/news"}>
            <li className="hidden lg:inline text-slate-700 hover:underline">
              News Articles
            </li>
          </Link>
        </ul>

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <img
                  src={currentUser.profilePicture}
                  alt="user photo"
                  className="w-10 h-10 rounded-full cursor-pointer" // Added cursor-pointer
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-400" />

              {/* Prevent closing on this item */}
              <DropdownMenuItem
                className="block font-semibold text-sm"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex flex-col gap-1">
                  <span>{currentUser.username}</span>
                  <span>{currentUser.email}</span>
                </div>
              </DropdownMenuItem>

              {/* Navigate to profile, but prevent closing */}
              <DropdownMenuItem
                className="font-semibold mt-2"
                onSelect={(e) => {
                  e.preventDefault(); // Prevent closing
                  navigate("/dashboard?tab=profile"); // Perform navigation
                }}
              >
                Profile
              </DropdownMenuItem>

              {/* Sign out, likely you DO want this to close */}
              <DropdownMenuItem
                className="font-semibold mt-2"
                onClick={handleSignout} // onClick is fine here as you want it to close after signout
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to={"/sign-in"}>
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
