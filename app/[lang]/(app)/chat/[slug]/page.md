"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import LoadingAnimation from "@/components/chat/loading-animation";
import { db } from "@/db";
import { chats as chatsTable } from "@/db/schema";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCategorySidebar } from "@/components/layout/sidebar/category-sidebar";
import { useSubCategorySidebar } from "@/components/layout/sidebar/subcategory-sidebar";
import { aiService } from "@/services/ai-service";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import {MessageList} from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useAIModelStore } from "@/store/ai-model-store";
import { useChatInputStore } from "@/store/chat-store";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm"; // Import eq from drizzle-orm

// Define ChatState interface to match the one expected by ChatInput
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const MIN_HEIGHT = 48;
const MAX_HEIGHT = 164;

function sanitizeForDrizzle(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined && item !== null)
      .map(item => sanitizeForDrizzle(item));
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      const sanitizedValue = sanitizeForDrizzle(value);
      if (
        sanitizedValue === null ||
        typeof sanitizedValue === 'string' ||
        typeof sanitizedValue === 'number' ||
        typeof sanitizedValue === 'boolean' ||
        Array.isArray(sanitizedValue) ||
        (typeof sanitizedValue === 'object' && sanitizedValue !== null)
      ) {
        sanitized[key] = sanitizedValue;
      } else {
        console.warn(`Invalid value type for key ${key}: ${typeof sanitizedValue}. Skipping.`);
      }
    }
    return sanitized;
  }

  console.error(`Unsupported type: ${typeof obj}. Skipping.`);
  return null;
}

function validateMessage(message: Message): boolean {
  if (typeof message.id !== 'string' || message.id.length === 0) return false;
  if (message.role !== 'user' && message.role !== 'assistant') return false;
  if (typeof message.content !== 'string') return false;
  if (typeof message.timestamp !== 'string') return false;
  if (message.image_urls) {
    if (!Array.isArray(message.image_urls)) return false;
    for (const url of message.image_urls) {
      if (typeof url !== 'string') return false;
    }
  }
  if (message.reasoning) {
    if (typeof message.reasoning !== 'object' || message.reasoning === null) return false;
    if (typeof message.reasoning.thinking !== 'string' || typeof message.reasoning.answer !== 'string') return false;
  }
  return true;
}

// Helper function to strip prefixes from input
function stripPrefixes(input: string): string {
  // Add your prefix stripping logic here if needed
  return input;
}

interface AIResponse {
  text_response: string;
  image_urls: string[];
  model_used: string;
}

type Params = {
  slug: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const params = useParams<Params>() ?? { slug: "" };
  // Generate a random test chat ID if not available from URL params
  const [testChatId] = React.useState<string>(() => uuidv4())
  const chatId = params.slug || testChatId;
  
  console.log("Using chat ID:", chatId, "from params:", params.slug ? "URL params" : "generated test ID");
  
  const queryClient = useQueryClient();
  const { statecategorysidebar } = useCategorySidebar();
  const { statesubcategorysidebar } = useSubCategorySidebar();
  
  // Use Zustand stores for state management
  const { currentModel, setModel } = useAIModelStore();
  const { 
    value, setValue,
    inputHeight, setInputHeight,
    showSearch, toggleSearch,
    showResearch, toggleResearch,
    showThinking, setShowThinking, toggleThinking,
    imagePreview, setImagePreview,
  } = useChatInputStore();

  // Local state for chat state management with proper React setState
  const [chatState, setChatState] = React.useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });

  // Local state for session-specific variables
  const messagesEndRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const [sessionId, setSessionId] = React.useState<string>(params.slug);
  const [initialResponseGenerated, setInitialResponseGenerated] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(true);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  });

  // Fetch user data on mount using Better Auth
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authClient.getSession();
        setUser(sessionData?.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Fetch chat data from Drizzle/Turso
  useEffect(() => {
    if (!chatId) return;
    const fetchChat = async () => {
      try {
        // Use eq from drizzle-orm for column comparisons
        const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId));
        if (chatRows.length > 0) {
          const chat:any = chatRows[0];
          const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
          setChatState(prevState => ({
            ...prevState,
            messages,
          }));
          if (chat.model && currentModel !== chat.model) {
            setModel(chat.model);
          }
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
        setChatState(prevState => ({
          ...prevState,
          error: "Failed to load chat"
        }));
        toast.error("Failed to load chat");
      }
    };
    fetchChat();
  }, [chatId, currentModel, setModel]);

  useEffect(() => {
    const shouldGenerateResponse = sessionStorage.getItem("autoSubmit") === "true";
    const storedModel = sessionStorage.getItem("selectedAI");

    if (
      shouldGenerateResponse &&
      sessionId &&
      chatState.messages.length > 0 &&
      !initialResponseGenerated &&
      !chatState.isLoading
    ) {
      const generateInitialResponse = async () => {
        try {
          // Use React's setState with function form
          setChatState(prevState => ({
            ...prevState,
            isLoading: true,
            error: null
          }));
          sessionStorage.removeItem("autoSubmit");
          sessionStorage.removeItem("initialPrompt");
          setInitialResponseGenerated(true);

          const lastMessage = chatState.messages[chatState.messages.length - 1];
          if (lastMessage.role !== "user") {
            setChatState(prevState => ({
              ...prevState,
              isLoading: false
            }));
            return;
          }

          // Update to use Zustand setModel
          if (storedModel) {
            setModel(storedModel);
          }

          const aiResponse = await aiService.generateResponse(lastMessage.content);
          console.log("Raw aiResponse (initial):", aiResponse);

          const assistantMessageBase = {
            id: uuidv4(),
            role: "assistant" as const,
            content: typeof aiResponse === "string" ? aiResponse : aiResponse.text_response,
            timestamp: new Date().toISOString(),
          };

          const assistantMessage: Message = {
            ...assistantMessageBase,
            ...(typeof aiResponse !== "string" && aiResponse.image_urls?.length > 0
              ? { image_urls: aiResponse.image_urls.filter(url => typeof url === "string") } 
              : {}),
            ...(typeof aiResponse === "string" && lastMessage.content.includes("reasoning")
              ? { reasoning: { thinking: "Processing...", answer: aiResponse } }
              : {}),
          };

          const sanitizedMessage = sanitizeForDrizzle(assistantMessage);
          if (!validateMessage(sanitizedMessage)) {
            throw new Error("Invalid assistant message structure");
          }

          // Fetch current messages from DB using eq
          const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, sessionId));
          if (chatRows.length === 0) {
            throw new Error("Chat not found");
          }
          
          const chat:any = chatRows[0];
          const currentMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
          const updatedMessages = [...currentMessages, sanitizedMessage];
          
          // Update the chat with new message using eq
          await db.update(chatsTable)
            .set({
              messages: JSON.stringify(updatedMessages),
              updated_at: new Date().toISOString(), // Use snake_case
            })
            .where(eq(chatsTable.id, sessionId));

          // Update local state with the new message
          setChatState(prevState => ({
            ...prevState,
            messages: updatedMessages,
            isLoading: false
          }));
        } catch (error) {
          console.error("Error generating initial response:", error);
          setChatState(prevState => ({
            ...prevState,
            isLoading: false,
            error: "Failed to generate AI response"
          }));
          toast.error("Failed to generate initial AI response");
        }
      };

      generateInitialResponse();
    }
  }, [sessionId, chatState.messages, chatState.isLoading, initialResponseGenerated, setModel]);

  // Add this function to create a chat if it doesn't exist
  const createChatIfNotExists = async (chatId: string, userId: string = "guest-user") => {
    try {
      // Check if chat already exists
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId));
      
      if (chatRows.length === 0) {
        console.log("Creating new chat with ID:", chatId);
        
        // Create current timestamp once for consistency
        const timestamp = new Date().toISOString();
        
        // Format data correctly for database
        const chatData = {
          id: chatId,
          title: "New Conversation",
          messages: "[]", // Empty array as string
          model: currentModel,
          visibility: "public",
          createdAt: timestamp,
          updatedAt: timestamp,
          creatorUid: userId,
          // Make sure JSON is properly stringified
          reactions: JSON.stringify({
            likes: {},
            dislikes: {}
          }),
          participants: JSON.stringify([userId]),
          views: 0,
          uniqueViewers: JSON.stringify([]),
          isPinned: false // Use boolean false instead of 0
        };
        
        console.log("Inserting chat with data:", chatData);
        
        // Insert with correct column names
        await db.insert(chatsTable).values(chatData);
        
        return true; // Chat was created
      }
      return false; // Chat already existed
    } catch (error) {
      console.error("Error creating chat:", error);
      // Show user-friendly error instead of throwing
      toast.error("Failed to initialize chat. Please refresh the page.");
      return false;
    }
  };

  // Modify the handleSubmit function to create a chat if it doesn't exist
  const handleSubmit = async () => {
    console.log("handleSubmit called in chat page", {
      valueLength: value.length,
      valueTrimLength: value.trim().length,
      chatId,
      isLoading: chatState.isLoading
    });
    
    if (!value.trim()) {
      console.log("Empty message, not submitting");
      toast.error("Cannot send empty message");
      return;
    }
    
    if (!chatId) {
      console.log("No chat ID, not submitting");
      toast.error("Chat ID is missing");
      return;
    }
    
    if (chatState.isLoading) {
      console.log("Already loading, not submitting");
      toast.info("Already processing a message");
      return;
    }
    
    toast.info("Processing your message...");
    console.log("Setting loading state and showing thinking indicator");
    
    // Set both local and global thinking states
    setChatState(prevState => ({
      ...prevState,
      isLoading: true,
      error: null
    }));
    setShowThinking(true);
    
    try {
      console.log("Processing value:", value.trim());
      const processedValue = stripPrefixes(value.trim());
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: processedValue,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Created user message:", userMessage);
      const sanitizedUserMessage = sanitizeForDrizzle(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        console.error("Invalid message structure:", sanitizedUserMessage);
        throw new Error("Invalid user message structure");
      }
      
      // Use a guest user ID if not authenticated
      const userId = user?.user?.id || "guest-user";
      console.log("Using user ID:", userId);
      
      // Check if chat exists, create if not
      console.log("Checking/creating chat with ID:", chatId);
      const chatCreated = await createChatIfNotExists(chatId, userId);
      
      if (!chatCreated) {
        console.warn("Chat creation may have failed, but continuing...");
      }
      
      console.log("Fetching chat from database with ID:", chatId);
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId));
      if (chatRows.length === 0) {
        console.error("Chat still not found after creation attempt:", chatId);
        throw new Error("Chat not found. Please refresh the page and try again.");
      }
      
      const chat:any = chatRows[0];
      console.log("Found chat:", chat.id);
      const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      const updatedMessages = [...messages, sanitizedUserMessage];
      
      console.log("Updating chat in database");
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updatedAt: new Date().toISOString(), // Use snake_case
          creatorUid: userId, // Use snake_case
        })
        .where(eq(chatsTable.id, chatId));
      
      console.log("Updating local chat state");
      setChatState(prevState => ({
        ...prevState,
        messages: updatedMessages
      }));
      
      console.log("Clearing input value");
      setValue("");
      
      console.log("Generating AI response");
      await handleAIResponse(processedValue);
    } catch (error) {
      console.error("Error submitting message:", error);
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: "Failed to send message"
      }));
      toast.error("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      // Clear thinking state if there was an error
      if (chatState.error) {
        console.log("Error in chat state, resetting loading and thinking states");
        setChatState(prevState => ({
          ...prevState,
          isLoading: false
        }));
        setShowThinking(false);
      }
    }
  };

  // Modify handleAIResponse to properly manage thinking state
  const handleAIResponse = async (userInput: string) => {
    try {
      // Set both local and global thinking states
      setChatState(prevState => ({
        ...prevState,
        isLoading: true
      }));
      setShowThinking(true); // Use setShowThinking instead of toggleThinking
      
      // Call AI service with proper typing
      const aiResponse = await aiService.generateResponse(userInput);
      
      // Create assistant message from response
      const assistantMessageBase = {
        id: uuidv4(),
        role: "assistant" as const,
        content: typeof aiResponse === "string" ? aiResponse : aiResponse.text_response,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: Message = {
        ...assistantMessageBase,
        ...(typeof aiResponse !== "string" && aiResponse.image_urls?.length > 0
          ? { image_urls: aiResponse.image_urls.filter(url => typeof url === "string") } 
          : {}),
      };

      const sanitizedMessage = sanitizeForDrizzle(assistantMessage);
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure");
      }

      // Fetch current messages using eq
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId));
      if (chatRows.length === 0) {
        throw new Error("Chat not found");
      }
      
      const chat:any = chatRows[0];
      const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      const updatedMessages = [...messages, sanitizedMessage];
      
      // Update chat with AI response using eq
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updated_at: new Date().toISOString(), // Use snake_case
        })
        .where(eq(chatsTable.id, chatId));
      
      // Update local state and clear thinking state
      setChatState(prevState => ({
        ...prevState,
        messages: updatedMessages,
        isLoading: false
      }));
      setShowThinking(false); // Use setShowThinking instead of toggleThinking
    } catch (error) {
      console.error("Error generating AI response:", error);
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: "Failed to generate AI response"
      }));
      toast.error("Failed to generate AI response");
    } finally {
      // Ensure thinking state is cleared even if there's an error
      setShowThinking(false); // Use setShowThinking instead of toggleThinking
      setChatState(prevState => ({
        ...prevState,
        isLoading: false
      }));
    }
  };

  const handleURLAnalysis = async (
    urls: string[],
    prompt: string,
    type: string = "url_analysis"
  ): Promise<void> => {
    try {
      // Set both local and global thinking states
      setChatState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null
      }));
      setShowThinking(true); // Use setShowThinking instead of toggleThinking
      
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: `Analyze this: ${urls.join(", ")} ${prompt ? `\n\n${prompt}` : ""}`,
        timestamp: new Date().toISOString(),
      };

      const sanitizedUserMessage = sanitizeForDrizzle(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure for URL analysis");
      }

      // Fetch current messages using eq
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, sessionId));
      if (chatRows.length === 0) {
        throw new Error("Chat not found");
      }
      
      const chat:any = chatRows[0];
      const currentMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages);
      const updatedMessages = [...currentMessages, sanitizedUserMessage];
      
      // Update chat with user message using eq
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updated_at: new Date().toISOString(),
        })
        .where(eq(chatsTable.id, sessionId));

      // Update local state
      setChatState(prevState => ({
        ...prevState,
        messages: updatedMessages
      }));
      
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/analyze_media_from_url`;
      const payload = { urls, prompt };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseData = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: responseData.response || responseData.text || "Analysis complete.",
        timestamp: new Date().toISOString(),
      };

      const sanitizedMessage = sanitizeForDrizzle(assistantMessage);
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure for URL analysis");
      }

      // Get updated messages after user message was added using eq
      const updatedChatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, sessionId));
      if (updatedChatRows.length === 0) {
        throw new Error("Chat not found");
      }
      
      const updatedChat:any = updatedChatRows[0];
      const latestMessages = Array.isArray(updatedChat.messages) ? updatedChat.messages : JSON.parse(updatedChat.messages);
      const finalMessages = [...latestMessages, sanitizedMessage];
      
      // Update chat with AI response using eq
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(finalMessages),
          updated_at: new Date().toISOString(),
        })
        .where(eq(chatsTable.id, sessionId));
      
      // Update local state
      setChatState(prevState => ({
        ...prevState,
        messages: finalMessages,
        isLoading: false
      }));
      setShowThinking(false); // Use setShowThinking instead of toggleThinking
    } catch (error) {
      console.error("Error in URL analysis:", error);
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to analyze URL content"
      }));
      toast.error("Failed to analyze content");
    } finally {
      // Ensure thinking state is cleared even if there's an error
      setShowThinking(false); // Use setShowThinking instead of toggleThinking
    }
  };

  // Modify handleAIGenerate to properly manage thinking state
  const handleAIGenerate = useCallback(async (prompt: string, messages: any[] = []) => {
    try {
      // Set both local and global thinking states
      setChatState(prevState => ({
        ...prevState,
        isLoading: true
      }));
      setShowThinking(true); // Use setShowThinking instead of toggleThinking
      
      // Call AI service to generate response
      const aiResponse = await aiService.generateResponse(prompt);
      
      // Process response
      const formattedResponse = typeof aiResponse === "string" 
        ? aiResponse 
        : aiResponse.text_response;
      
      setChatState(prevState => ({
        ...prevState,
        isLoading: false
      }));
      setShowThinking(false); // Use setShowThinking instead of toggleThinking
      
      return formattedResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: "Failed to generate AI response"
      }));
      toast.error("Failed to generate AI response");
      return null;
    } finally {
      // Ensure thinking state is cleared even if there's an error
      setShowThinking(false); // Use setShowThinking instead of toggleThinking
    }
  }, []);

  const handleAdjustHeight = useCallback(
    (reset = false) => {
      if (!textareaRef.current) return;

      if (reset) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
        setInputHeight(MIN_HEIGHT);
        return;
      }

      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Update input height in Zustand store
      setInputHeight(newHeight);
    },
    [textareaRef, setInputHeight]
  );

  // Loading state while user authentication is in progress
  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div
      className={cn(
        "relative flex min-h-full w-full flex-col transition-all duration-200 ease-linear"
      )}
    >
      {chatState.error && (
        <div className="bg-destructive/90 absolute inset-x-0 top-0 z-50 p-2 text-center text-sm">
          {chatState.error}
        </div>
      )}
      <MessageList
        chatId={sessionId}
        messages={chatState.messages}
        messagesEndRef={messagesEndRef}
        isThinking={chatState.isLoading || showThinking} // Pass both states
        selectedAI={currentModel}
      />
      <ChatInput
        className="fixed bottom-64 left-1/2 z-50 -translate-x-1/2"
        value={value}
        chatState={chatState}
        setChatState={setChatState}
        inputHeight={inputHeight}
        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
        onSubmit={handleSubmit}
        onChange={setValue}
        onHeightChange={handleAdjustHeight}
        onUrlAnalysis={handleURLAnalysis}
        onAIGenerate={handleAIGenerate}
        onImageChange={(file) => 
          setImagePreview(file ? URL.createObjectURL(file) : null)
        }
      />
    </div>
  );
}
