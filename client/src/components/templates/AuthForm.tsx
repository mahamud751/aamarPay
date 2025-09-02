"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/hooks/auth";

interface FormInputs {
  name?: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthFormProps {
  onClose: () => void;
  redirectUrl?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose, redirectUrl }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormInputs>();
  const [authError, setAuthError] = useState("");
  const { loginUser, registerUser, googleSignIn } = useAuth();

  if (!loginUser || !registerUser || !googleSignIn) {
    throw new Error(
      "AuthContext is undefined. Please ensure you are using UserProvider."
    );
  }

  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const { name, email, phone, password } = data;
    setLoading(true);
    setAuthError("");
    try {
      if (isSignup) {
        await registerUser(name!, email, phone!, password, redirectUrl);
      } else {
        await loginUser(email, password, redirectUrl);
      }
      onClose();
    } catch (error) {
      console.error(error);
      setAuthError("Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
      <div className="flex justify-center">
        <Link href="/">
          <Image
            src="/assets/logo4.png"
            width={500}
            height={500}
            alt="icon"
            className="ml-2 w-[120px]"
          />
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-purple-800 text-center mb-5">
        {isSignup ? "Create Account" : "Hi, Welcome Back"}
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {isSignup && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              }`}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        {isSignup && (
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              }`}
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>
        )}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={toggleShowPassword}
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-500" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {authError && <p className="text-red-500">{authError}</p>}
        <button
          type="submit"
          className={`w-full bg-purple-800 text-white p-3 rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-300 ease-in-out ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
        </button>
      </form>
      <div className="flex flex-col items-center mt-3">
        <button
          type="button"
          onClick={() => googleSignIn(redirectUrl)}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Sign {isSignup ? "Up" : "In"} with Google
        </button>

        <p className="text-sm mt-2">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-purple-800 font-bold"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
