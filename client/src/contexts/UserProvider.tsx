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
import { Session } from "next-auth";
import { Gender, User, UserRole, UserStatus } from "@/services/types/Types";

// Extend the Session type to include our custom properties
interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string; // Removed null from union type to match Session type
    email?: string; // Removed null from union type to match Session type
    image?: string; // Removed null from union type to match Session type
    role?: string;
    photos?: any[];
  };
  accessToken?: string;
}

// Utility function to normalize and validate redirect URL
const normalizeRedirectUrl = (url?: string): string => {
  // Default to "/" if no URL is provided
  if (!url) return "/";

  // If the URL is an absolute URL, extract the pathname
  try {
    const parsedUrl = new URL(url, window.location.origin);
    // Only allow redirects to the same origin
    if (parsedUrl.origin !== window.location.origin) {
      console.warn("Invalid redirect URL: External domains are not allowed.");
      return "/";
    }
    // Return the pathname (e.g., "/dashboard")
    return parsedUrl.pathname || "/";
  } catch {
    // If URL parsing fails, assume it's a relative path and ensure it starts with "/"
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

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Cast session to our extended type
      const extendedSession = session as ExtendedSession;

      setUser({
        id: extendedSession.user?.id || "",
        name: extendedSession.user?.name || "Unknown",
        email: extendedSession.user?.email || "",
        phone: null,
        referralCode: null,
        gender: Gender.Other,
        password: null,
        address: null,
        role: (extendedSession.user?.role as UserRole) || UserRole.user,
        branchId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: UserStatus.active,
        photos: extendedSession.user?.photos || [],
        lastVisited: [],
        provider: null,
        providerId: null,
      });
      setToken(extendedSession.accessToken || null);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", extendedSession.accessToken || "");
        Cookies.set("authToken", extendedSession.accessToken || "", {
          expires: 1,
          path: "/",
        });
      }
    } else if (status === "unauthenticated") {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        Cookies.remove("authToken");
      }
    }
  }, [session, status]);

  useEffect(() => {
    if (typeof window !== "undefined" && user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token || "");
    }
  }, [user, token]);

  const loginUser = async (
    email: string,
    password: string,
    redirectUrl?: string
  ) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
        {
          email,
          password,
        }
      );
      if (response.status === 201) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        Cookies.set("authToken", token, { expires: 1, path: "/" });
        // Normalize redirect URL before pushing
        const normalizedUrl = normalizeRedirectUrl(redirectUrl);
        router.push(normalizedUrl);
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred. Please try again later.";
      MySwal.fire({
        icon: "error",
        title: "Login Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

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
        {
          name,
          email,
          phone,
          password,
        }
      );
      if (response.status === 201) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        Cookies.set("authToken", token, { expires: 1, path: "/" });
        // Normalize redirect URL before pushing
        const normalizedUrl = normalizeRedirectUrl(redirectUrl);
        router.push(normalizedUrl);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred. Please try again later.";
      MySwal.fire({
        icon: "error",
        title: "Registration Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = (redirectUrl?: string) => {
    // Normalize redirect URL before passing to signIn
    const normalizedUrl = normalizeRedirectUrl(redirectUrl);
    signIn("google", { callbackUrl: normalizedUrl });
  };

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
