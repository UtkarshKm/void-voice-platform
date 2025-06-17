"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Loader2,
  Send,
  MessageCircle,
  RefreshCw,
  Heart,
  Shield,
  Users,
  Sparkles,
  Lightbulb
} from "lucide-react";
import axios from "axios";
import { messageSchema } from "@/schemas/messageSchema";

type MessageFormData = {
  content: string;
};

export default function SendMessagePage() {
  const params = useParams();
  const usernameParam = params?.username;
  const username = Array.isArray(usernameParam)
    ? decodeURIComponent(usernameParam[0] ?? "")
    : decodeURIComponent(usernameParam ?? "");

  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const { watch, setValue, reset, trigger } = form;
  const content = watch("content");

  const onSubmit = async (data: MessageFormData) => {
    setIsSending(true);
    try {
      const response = await axios.post("/api/send-message", {
        username,
        content: data.content,
      });

      if (response.data.success) {
        toast.success("Message sent anonymously!");
        reset();
        setSent(true);
        setMessageCount((prev) => prev + 1);
      } else {
        toast.error(response.data.message || "Message failed to send.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to send message.");
      } else {
        toast.error("Failed to send message.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const getSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await axios.post("/api/suggest-messages");

      if (response.data.success) {
        const suggestionList = response.data.text
          .split("||")
          .map((s: string) => s.trim());
        setSuggestions(suggestionList);
        toast.success("AI suggestions loaded!");
      } else {
        toast.error("Failed to get suggestions");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to get AI suggestions");
      } else {
        toast.error("Failed to get AI suggestions");
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // ✅ Fixed: Trigger validation after setting value
  const applySuggestion = async (suggestion: string) => {
    setValue("content", suggestion);
    // ✅ Trigger validation to update form state
    await trigger("content");
    setSuggestions([]);
    toast.success("Suggestion applied!");
  };

  const handleSendAnother = () => {
    setSent(false);
    reset();
    setSuggestions([]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Void Voice</h1>
          <p className="text-muted-foreground">Anonymous feedback platform</p>
        </div>

        {/* Main Card */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Send Anonymous Message
            </CardTitle>
            <CardDescription>
              Leave a message for{" "}
              <Badge variant="secondary" className="font-semibold">
                @{username}
              </Badge>
            </CardDescription>
          </CardHeader>

          {!sent ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Guidelines */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Heart className="w-4 h-4 text-red-500" />
                      Guidelines for kind feedback:
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Be respectful and constructive</li>
                      <li>• Focus on specific behaviors, not personal attacks</li>
                      <li>• Share genuine thoughts that could help them grow</li>
                      <li>• Remember: your words have impact, even anonymously</li>
                    </ul>
                  </div>

                  {/* AI Suggestions Button */}
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      onClick={getSuggestions}
                      disabled={isLoadingSuggestions}
                      variant="outline"
                      size="sm"
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      {isLoadingSuggestions ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Getting ideas...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-3 w-3" />
                          Get AI Suggestions
                        </>
                      )}
                    </Button>
                    {suggestions.length > 0 && (
                      <Button
                        type="button"
                        onClick={() => setSuggestions([])}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        Clear suggestions
                      </Button>
                    )}
                  </div>

                  {/* AI Suggestions Display */}
                  {suggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        AI Suggestions (click to use):
                      </div>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            type="button"
                            onClick={() => applySuggestion(suggestion)}
                            variant="outline"
                            className="w-full text-left justify-start h-auto p-3 border-dashed hover:border-solid hover:bg-primary/5"
                          >
                            <div className="text-sm text-foreground whitespace-pre-wrap">
                              {suggestion}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share your thoughts anonymously...

Examples:
• 'Your presentation skills have really improved!'
• 'I appreciate how you always help others'
• 'Consider being more open to different perspectives'"
                            className="min-h-[120px] resize-none"
                            maxLength={500}
                            disabled={isSending}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center text-xs">
                          <FormMessage />
                          <span
                            className={content.length > 450 ? "text-orange-500" : "text-muted-foreground"}
                          >
                            {content.length}/500
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* ✅ Fixed Privacy Notice - Better spacing and layout */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      <div className="font-semibold mb-1">100% Anonymous</div>
                      <div>
                        Your identity will never be revealed. No tracking, no logging, complete privacy guaranteed.
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* ✅ Fixed CardFooter - Added proper padding */}
                <CardFooter className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                    disabled={isSending || !form.formState.isValid}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending anonymously...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Anonymous Message
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          ) : (
            <CardContent className="text-center space-y-6 py-8">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your anonymous message has been delivered to @{username}
                  </p>
                  {messageCount > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {messageCount} messages sent this session
                    </Badge>
                  )}
                </div>

                <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
                  <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                    Thank you for sharing constructive feedback!
                    Your voice helps create a better community.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button
                  onClick={handleSendAnother}
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/5 h-11"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Send Another Message
                </Button>

                <p className="text-xs text-muted-foreground">
                  Have more feedback? Feel free to send another anonymous message.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Powered by Void Voice - Anonymous Feedback Platform</p>
          <p>Your privacy is our priority. Messages are completely anonymous.</p>
        </div>
      </div>
    </div>
  );
}