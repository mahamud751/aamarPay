"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import axios from "axios";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { User } from "../types/types";

// 🔹 Utility to normalize redirect URL
const normalizeRedirectUrl = (url?: string): string => {
  if (!url) return "/";
  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (parsedUrl.origin !== window.location.origin) {
      console.warn("Invalid redirect URL: External domains are not allowed.");
      return "/";
    }
    return parsedUrl.pathname || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
};

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (
    email: string,
    password: string,
    redirectUrl?: string
  ) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    phone: string,
    password: string,
    redirectUrl?: string
  ) => Promise<void>;
  logoutUser: () => void;
  loading: boolean;
  googleSignIn: (redirectUrl?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const MySwal = withReactContent(Swal);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Hydrate from localStorage first
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || null;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 🔹 Sync with NextAuth session
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      const sessionUser: User = {
        id: session.user.id || "",
        name: session.user.name || "Unknown",
        email: session.user.email || "",
        role: session.user.role || "user",
        photos: session.user.photos || [],
      };

      const sessionToken = session.accessToken || null;

      setUser(sessionUser);
      setToken(sessionToken);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(sessionUser));
        if (sessionToken) localStorage.setItem("token", sessionToken);
        Cookies.set("authToken", sessionToken || "", { expires: 1, path: "/" });
      }
    } else if (status === "unauthenticated") {
      // 🔥 Only clear if there's no valid token in localStorage
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          Cookies.remove("authToken");
        }
      }
    }
  }, [session, status, isInitialized]);

  // 🔹 Keep localStorage in sync if user or token changes
  useEffect(() => {
    if (typeof window !== "undefined" && user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    }
  }, [user, token]);

  // 🔹 Login handler
  const loginUser = async (
    email: string,
    password: string,
    redirectUrl?: string
  ) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
        { email, password }
      );

      if (response.status === 201) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        Cookies.set("authToken", token, { expires: 1, path: "/" });
        router.push(normalizeRedirectUrl(redirectUrl));
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error: any) {
      MySwal.fire({
        icon: "error",
        title: "Login Error",
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Register handler
  const registerUser = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    redirectUrl?: string
  ) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`,
        { name, email, phone, password }
      );

      if (response.status === 201) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        Cookies.set("authToken", token, { expires: 1, path: "/" });
        router.push(normalizeRedirectUrl(redirectUrl));
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      MySwal.fire({
        icon: "error",
        title: "Registration Error",
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Sign In
  const googleSignIn = (redirectUrl?: string) => {
    signIn("google", { callbackUrl: normalizeRedirectUrl(redirectUrl) });
  };

  // 🔹 Logout
  const logoutUser = () => {
    signOut({ callbackUrl: "/" });
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      Cookies.remove("authToken");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginUser,
        registerUser,
        logoutUser,
        loading,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
