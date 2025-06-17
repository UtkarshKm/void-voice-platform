"use client";
import {Separator} from "@/components/ui/separator";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Message} from "@/model/Users";
import {acceptMessageSchema} from "@/schemas/accecptMessageSchema";
import {ApiResponse} from "@/types/ApiResponse";
import {zodResolver} from "@hookform/resolvers/zod";
import axios, {AxiosError} from "axios";
import {User} from "next-auth";
import {useSession} from "next-auth/react";
import React, {useCallback, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import MessageCard from "@/components/MessageCard";
import {
  Copy,
  RefreshCw,
  MessageSquare,
  Link2,
  Eye,
  EyeOff,
  Inbox,
  ExternalLink,
} from "lucide-react";

function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const {data: session} = useSession();
  
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const {watch, setValue} = form; // ✅ Removed unused register
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponse>("/api/accept-message");
      setValue("acceptMessages", response.data.isAcceptingMessages as boolean);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      if (axiosError.response?.status !== 401) {
        toast.error(
          axiosError.response?.data.message ||
            "Error fetching accept messages setting"
        );
      }
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        
        if (response.data.success) {
          setMessages(response.data.messages || []);
          
          if (refresh) {
            toast.success("Messages refreshed successfully");
          }
        } else {
          toast.error(response.data.message || "Failed to fetch messages");
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        if (axiosError.response?.status !== 401 && refresh) {
          toast.error(
            axiosError.response?.data.message || "Error fetching messages"
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!session || !session.user) {
      return;
    }

    const timer = setTimeout(() => {
      fetchMessages();
      fetchAcceptMessages();
    }, 100);

    return () => clearTimeout(timer);
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/accept-message", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ||
          "Error in switching messages accept status"
      );
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const {username} = (session?.user as User) || {};
  
  const baseURL = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}` 
    : '';
  const profileURL = username ? `${baseURL}/u/${username}` : '';

  const copyToClipboard = () => {
    if (profileURL) {
      navigator.clipboard.writeText(profileURL);
      toast.success("Profile link copied to clipboard!");
    } else {
      toast.error("Profile link not available");
    }
  };

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-card-foreground">
              Access Denied
            </CardTitle>
            <CardDescription>
              Please sign in to view your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Void Voice Dashboard
              </h1>
              <p className="text-muted-foreground">
                Your anonymous feedback collection center
              </p>
            </div>
            <Badge
              variant={acceptMessages ? "default" : "secondary"}
              className="text-sm"
            >
              {acceptMessages ? "Accepting Messages" : "Messages Paused"}
            </Badge>
          </div>
          <Separator className="bg-border" />
        </div>

        {/* Stats and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Message Statistics */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Messages
              </CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {messages.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {/* ✅ Removed "Anonymous feedback received" */}
                Messages in the void
              </p>
            </CardContent>
          </Card>

          {/* Accept Messages Control */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Message Status
              </CardTitle>
              {acceptMessages ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={acceptMessages}
                  onCheckedChange={handleSwitchChange}
                  disabled={isSwitchLoading}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm text-foreground">
                  {acceptMessages ? "Accepting" : "Paused"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Toggle to control anonymous message reception
              </p>
            </CardContent>
          </Card>

          {/* Profile Link */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Your Profile Link
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-accent"
                  disabled={!profileURL}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                {profileURL && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hover:bg-accent"
                  >
                    <a
                      href={profileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground break-all">
                {profileURL || "Loading..."}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border" />

        {/* Messages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Anonymous Messages
              </h2>
            </div>
            <Button
              onClick={() => fetchMessages(true)}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-border hover:bg-accent"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {/* Messages Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-card border-border animate-pulse"
                >
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messages.map((message) => (
                <MessageCard
                  key={message._id as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  No messages yet
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Share your profile link to start receiving anonymous feedback.
                  The void awaits voices...
                </p>
                <Button
                  onClick={copyToClipboard}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!profileURL}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Profile Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;