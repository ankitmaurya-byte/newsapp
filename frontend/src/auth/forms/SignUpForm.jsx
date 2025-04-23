import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import GoogleAuth from "@/components/shared/GoogleAuth";

// Define the validation schema for the form using Zod
const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }), // Corrected message punctuation
  email: z.string().email({ message: "Invalid email address." }), // Use .email() for email validation
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

const SignUpForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Local state for loading and error messages
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Define your form using react-hook-form and zodResolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values) {
    try {
      setLoading(true); // Set loading state to true
      setErrorMessage(null); // Clear any previous error messages

      // Use axios.post to send the sign-up request
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        values, // Data goes directly as the second argument
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // <-- Include credentials (cookies)
        }
      );

      const data = res.data; // axios puts the response body in .data

      // Check if the request was successful based on axios response status
      if (res.status !== 200 && res.status !== 201) {
        // Check for common success statuses
        // Use the message from the response data if available
        const errorMsg = data.message || "Sign up failed! Please try again.";
        toast({ title: errorMsg });
        setErrorMessage(errorMsg); // Set error message state
      } else {
        // If successful
        setErrorMessage(null); // Clear error message on success
        toast({ title: "Sign up Successful!" });
        navigate("/sign-in"); // Navigate to sign-in page on success
      }
    } catch (error) {
      console.error("Sign up error:", error); // Log the actual error
      // Handle network errors or errors from the server (e.g., 400, 500 status codes)
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast({ title: errorMsg });
      setErrorMessage(errorMsg); // Set error message state
    } finally {
      setLoading(false); // Reset loading state in finally block
    }
  }

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl sm:max-w-5xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link
            to={"/"}
            className="font-bold text-2xl sm:text-4xl flex flex-wrap"
          >
            <span className="text-slate-500">Morning</span>
            <span className="text-slate-900">Dispatch</span>
          </Link>

          <h2 className="text-[24px] md:text-[30px] font-bold leading-[140%] tracking-tighter pt-5 sm:pt-12">
            Create a new account
          </h2>

          <p className="text-slate-500 text-[14px] font-medium leading-[140%] md:text-[16px] md:font-normal mt-2">
            Welcome to Morning Dispatch, Please provide your details
          </p>
        </div>

        {/* right */}
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="xyz@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="bg-blue-500 w-full"
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <span>Sign Up</span>
                )}
              </Button>

              {/* Google Authentication Component */}
              <GoogleAuth />
            </form>
          </Form>

          {/* Link to Sign In page */}
          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">
              Sign In
            </Link>
          </div>

          {/* Display error message state */}
          {errorMessage && <p className="mt-5 text-red-500">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
