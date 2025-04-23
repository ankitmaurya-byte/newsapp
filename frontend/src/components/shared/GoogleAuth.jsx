import React from "react";
import { Button } from "../ui/button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "@/redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const GoogleAuth = () => {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const firebaseResponse = await signInWithPopup(auth, provider); // Use axios instead of fetch

      const res = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          name: firebaseResponse.user.displayName,
          email: firebaseResponse.user.email,
          profilePhotoUrl: firebaseResponse.user.photoURL,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // This is the key to include cookies
        }
      ); // Axios puts the response data in the 'data' property

      const data = res.data; // Axios throws an error for non-2xx status codes, so the check `res.ok` is not needed here. // If the request was successful, the code will continue past the await axios.post call.

      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      console.log(error); // You can access the error response data using error.response.data
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        console.log("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.log("Error request:", error.request);
      } else {
        console.log("Error message:", error.message);
      }
    }
  };

  return (
    <div>
         
      <Button
        type="button"
        className="bg-green-500 w-full"
        onClick={handleGoogleClick}
      >
                Continue with Google      
      </Button>
       
    </div>
  );
};

export default GoogleAuth;
