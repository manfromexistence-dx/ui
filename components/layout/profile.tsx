"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "../../lib/auth/auth-client";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'; // Keep for Language selector
import {
  Settings,
  CreditCard,
  FileText,
  Users,
  LogOut,
  Moon,
  Sun,
  Cog,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import router from "next/router";
import Link from "next/link";

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const [betterauth, setBetterAuth] = useState<any>(null); // Keep if used, or remove
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authClient.getSession();
        setUser(sessionData?.data);

        // If betterauth is still needed for other parts, keep this
        const accountsData = await authClient.listAccounts();
        setBetterAuth(accountsData);
      } catch (error) {
        // console.error("Failed to fetch user data:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            setUser(null);
            setBetterAuth(null);
            setOpen(false); // Close popover on sign out
            // Optionally, redirect: window.location.href = '/login';
          },
          onError: (error: any) => {
            // console.error("SignOut Error:", error);
            toast.error(
              error?.message || "Sign out failed. Please try again."
            );
          },
        },
      });
    } catch (error: any) {
      // console.error("SignOut Exception:", error);
      toast.error(
        error?.message || "An unexpected error occurred during sign out."
      );
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return "P"; // Default placeholder
    const nameParts = name.trim().split(/\\s+/);
    if (
      nameParts.length > 1 &&
      nameParts[0] &&
      nameParts[nameParts.length - 1]
    ) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    }
    if (nameParts[0] && nameParts[0].length >= 2) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    if (nameParts[0] && nameParts[0].length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    return "P";
  };

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  if (!user || !user.user) {
    return (
      <>
        <Button
          size={"sm"}
          variant="outline"
          className='size-8'
          onClick={toggleTheme}

        >
          {theme === 'light' ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
        </Button>
        <Link href="/sign-in">
          <Button
            size={"sm"}
            variant="outline"
          >
            Sign In
          </Button>
        </Link>
      </>

    );
  }

  const { user: userData } = user;
  const userImage = userData.image;
  const userName = userData.name;
  const userEmail = userData.email;
  const fallbackInitial = getInitials(userName || userEmail);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="rounded-full hover:bg-primary-foreground p-0.5">
          <Avatar className="size-7 cursor-pointer rounded-full">
            <AvatarImage src={userImage ?? undefined} alt={userName || "User"} />
            <AvatarFallback className="rounded-full text-[10px] flex items-center justify-center text-center">
              {fallbackInitial}
            </AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 py-1.5 text-left text-sm border-b hover:bg-primary-foreground px-3">
            <Avatar className="size-8 rounded-md">
              <AvatarImage
                src={userImage ?? undefined}
                alt={userName || "User"}
              />
              <AvatarFallback className="rounded-md">
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-sm font-semibold">
                {userName || "User"}
              </span>
              <span className="truncate text-xs">
                {userEmail || "No email"}
              </span>
            </div>
          </div>

          <nav className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-2 h-9 text-sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-2 h-9 text-sm"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pricing
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-2 h-9 text-sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-2 h-9 text-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Community
            </Button>
          </nav>

          <div className="p-3 border-t">
            <p className="text-sm mb-3">Preferences</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Theme</span>
                <div className="flex space-x-1 p-1 border rounded-full">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-1.5 rounded-full ${theme === "light" ? "bg-primary-foreground border" : ""
                      }`}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-1.5 rounded-full ${theme === "dark" ? "bg-primary-foreground border" : ""
                      }`}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-1.5 rounded-full ${theme === "system" ? "bg-primary-foreground border" : ""
                      }`}
                  >
                    <Cog className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Language</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-sm bg-transparent border"
                    >
                      {language}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-2 h-4 w-4"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="">
                    <DropdownMenuItem onClick={() => setLanguage("English")}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("Spanish")}>
                      Spanish
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("French")}>
                      French
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("German")}>
                      German
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {/* Displaying User, Session, and Account Information similar to page.tsx */}
          {user && user.user && (
            <div className="p-3 border-t text-xs text-muted-foreground max-h-48 overflow-y-auto">
              <h3 className="font-semibold text-sm text-foreground mb-1">User Details</h3>
              <p><strong>ID:</strong> {userData.id || "N/A"}</p>
              <p><strong>Email Verified:</strong> {userData.emailVerified ? "Yes" : "No"}</p>
              <p><strong>Anonymous:</strong> {userData.isAnonymous ? "Yes" : "No"}</p>
              <p><strong>Created:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>

              {user.session && (
                <>
                  <h3 className="font-semibold text-sm text-foreground mt-2 mb-1">Session</h3>
                  <p><strong>Session ID:</strong> {user.session.id || "N/A"}</p>
                  <p><strong>Expires:</strong> {new Date(user.session.expiresAt).toLocaleTimeString()}</p>
                </>
              )}

              {betterauth && betterauth.data && betterauth.data.length > 0 && (
                <>
                  <h3 className="font-semibold text-sm text-foreground mt-2 mb-1">Linked Accounts</h3>
                  {betterauth.data.map((account: any, index: number) => (
                    <div key={account.id} className="mt-1">
                      <p><strong>Provider {index + 1}:</strong> {account.provider || "N/A"}</p>
                      {/* Add more account details if needed */}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="justify-start px-3 py-2 h-9 text-sm rounded-none border-t text-red-600 hover:!text-red-600 focus:!text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}