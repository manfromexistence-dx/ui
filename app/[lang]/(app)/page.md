"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useCallback } from "react"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"

import { db } from "@/db"
import { chats as chatsTable } from "@/db/schema"
import { authClient } from "@/lib/auth/auth-client"
import { cn } from "@/lib/utils"
import { aiService } from "@/services/ai-service"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { useAIModelStore } from "@/store/ai-model-store"
import { useChatInputStore } from "@/store/chat-store"
import { useCategorySidebar } from "@/components/layout/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/layout/sidebar/subcategory-sidebar"
import { MessageList } from "@/components/chat/message-list"
import { ChatInput } from "@/components/chat/chat-input"
import LoadingAnimation from "@/components/chat/loading-animation"
import type { Message } from "@/types/chat"

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

type Params = {
  slug: string
}

function sanitizeForDrizzle(obj: any): any {
  if (obj === null || obj === undefined) return null
  
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined && item !== null)
      .map(item => sanitizeForDrizzle(item))
  }

  if (obj instanceof Date) return obj.toISOString()

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue
      const sanitizedValue = sanitizeForDrizzle(value)
      if (
        sanitizedValue === null ||
        typeof sanitizedValue === 'string' ||
        typeof sanitizedValue === 'number' ||
        typeof sanitizedValue === 'boolean' ||
        Array.isArray(sanitizedValue) ||
        (typeof sanitizedValue === 'object' && sanitizedValue !== null)
      ) {
        sanitized[key] = sanitizedValue
      }
    }
    return sanitized
  }

  return null
}

function validateMessage(message: Message): boolean {
  if (typeof message.id !== 'string' || message.id.length === 0) return false
  if (message.role !== 'user' && message.role !== 'assistant') return false
  if (typeof message.content !== 'string') return false
  if (typeof message.timestamp !== 'string') return false
  
  if (message.image_urls) {
    if (!Array.isArray(message.image_urls)) return false
    for (const url of message.image_urls) {
      if (typeof url !== 'string') return false
    }
  }
  
  if (message.reasoning) {
    if (typeof message.reasoning !== 'object' || message.reasoning === null) return false
    if (typeof message.reasoning.thinking !== 'string' || typeof message.reasoning.answer !== 'string') return false
  }
  
  return true
}

function stripPrefixes(input: string): string {
  return input
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams<Params>() ?? { slug: "" }
  // Generate a random test chat ID if not available from URL params
  const [testChatId] = React.useState<string>(() => uuidv4())
  const chatId = params.slug || testChatId
  
  console.log("Using chat ID:", chatId, "from params:", params.slug ? "URL params" : "generated test ID")
  
  const [user, setUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [sessionId, setSessionId] = React.useState<string>(params.slug)
  const [initialResponseGenerated, setInitialResponseGenerated] = React.useState(false)
  
  const { statecategorysidebar } = useCategorySidebar()
  const { statesubcategorysidebar } = useSubCategorySidebar()
  const { currentModel, setModel } = useAIModelStore()
  const { 
    value, setValue,
    inputHeight, setInputHeight,
    showSearch, toggleSearch,
    showResearch, toggleResearch,
    showThinking, setShowThinking, toggleThinking,
    imagePreview, setImagePreview,
  } = useChatInputStore()

  const [chatState, setChatState] = React.useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  })

  const messagesEndRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const sessionData = await authClient.getSession()
        setUser(sessionData?.data)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    if (!chatId) return
    
    const fetchChat = async () => {
      try {
        const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId))
        if (chatRows.length > 0) {
          const chat: any = chatRows[0]
          const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages)
          setChatState(prevState => ({
            ...prevState,
            messages,
          }))
          if (chat.model && currentModel !== chat.model) {
            setModel(chat.model)
          }
        }
      } catch (error) {
        console.error("Error fetching chat:", error)
        setChatState(prevState => ({
          ...prevState,
          error: "Failed to load chat"
        }))
        toast.error("Failed to load chat")
      }
    }
    fetchChat()
  }, [chatId, currentModel, setModel])
  useEffect(() => {
    const shouldGenerateResponse = sessionStorage.getItem("autoSubmit") === "true"
    const storedModel = sessionStorage.getItem("selectedAI")

    if (
      shouldGenerateResponse &&
      sessionId &&
      chatState.messages.length > 0 &&
      !initialResponseGenerated &&
      !chatState.isLoading
    ) {
      const generateInitialResponse = async () => {
        try {
          setChatState(prevState => ({
            ...prevState,
            isLoading: true,
            error: null
          }))
          sessionStorage.removeItem("autoSubmit")
          sessionStorage.removeItem("initialPrompt")
          setInitialResponseGenerated(true)

          const lastMessage = chatState.messages[chatState.messages.length - 1]
          if (lastMessage.role !== "user") {
            setChatState(prevState => ({
              ...prevState,
              isLoading: false
            }))
            return
          }

          if (storedModel) {
            setModel(storedModel)
          }

          const aiResponse = await aiService.generateResponse(lastMessage.content)

          const assistantMessageBase = {
            id: uuidv4(),
            role: "assistant" as const,
            content: typeof aiResponse === "string" ? aiResponse : aiResponse.text_response,
            timestamp: new Date().toISOString(),
          }

          const assistantMessage: Message = {
            ...assistantMessageBase,
            ...(typeof aiResponse !== "string" && aiResponse.image_urls?.length > 0
              ? { image_urls: aiResponse.image_urls.filter(url => typeof url === "string") } 
              : {}),
            ...(typeof aiResponse === "string" && lastMessage.content.includes("reasoning")
              ? { reasoning: { thinking: "Processing...", answer: aiResponse } }
              : {}),
          }

          const sanitizedMessage = sanitizeForDrizzle(assistantMessage)
          if (!validateMessage(sanitizedMessage)) {
            throw new Error("Invalid assistant message structure")
          }

          const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, sessionId))
          if (chatRows.length === 0) {
            throw new Error("Chat not found")
          }
          
          const chat: any = chatRows[0]
          const currentMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages)
          const updatedMessages = [...currentMessages, sanitizedMessage]
          
          await db.update(chatsTable)
            .set({
              messages: JSON.stringify(updatedMessages),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(chatsTable.id, sessionId))

          setChatState(prevState => ({
            ...prevState,
            messages: updatedMessages,
            isLoading: false
          }))
        } catch (error) {
          console.error("Error generating initial response:", error)
          setChatState(prevState => ({
            ...prevState,
            isLoading: false,
            error: "Failed to generate AI response"
          }))
          toast.error("Failed to generate initial AI response")
        }
      }

      generateInitialResponse()
    }
  }, [sessionId, chatState.messages, chatState.isLoading, initialResponseGenerated, setModel])
  // Initialize a test chat in the database if needed (for testing on home page)
  useEffect(() => {
    if (!params.slug && chatId) {
      const initializeTestChat = async () => {
        try {
          const created = await createChatIfNotExists(chatId, "test-user")
          if (created) {
            console.log("Successfully created test chat with ID:", chatId)
            // Initialize chat state with empty messages
            setChatState(prevState => ({
              ...prevState,
              messages: []
            }))
          } else {
            console.log("Test chat already exists:", chatId)
          }
        } catch (error) {
          console.error("Error initializing test chat:", error)
          toast.error("Failed to initialize test chat")
        }
      }
      
      initializeTestChat()
    }
  }, [chatId, params.slug, currentModel])
  
  // Add a function to ensure a user exists in the database
  const ensureUserExists = async (userId: string) => {
    try {
      // Import the user table properly
      const { user: userTable } = await import("@/db/schema");
      
      // Check if user exists
      const userExists = await db.select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.id, userId))
        .then(rows => rows.length > 0);
      
      if (!userExists) {
        console.log(`User ${userId} doesn't exist, creating a guest user`);
        // Create a guest user for testing if none exists
        await db.insert(userTable).values({
          id: userId,
          name: "Guest User",
          email: `${userId}@example.com`,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          isAnonymous: true
        });
        return true;
      }
      return true;
    } catch (error) {
      console.error(`Error ensuring user exists: ${error}`);
      // Don't throw error, just log it and continue
      return false;
    }
  };

  const createChatIfNotExists = async (chatId: string, userId: string = "guest-user") => {
    try {
      // Check if chat already exists
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId))
      
      if (chatRows.length === 0) {
        console.log("Creating new chat with ID:", chatId)
        
        // Try to ensure the user exists, but don't fail if it doesn't work
        try {
          await ensureUserExists(userId);
        } catch (userError) {
          console.warn("Could not ensure user exists:", userError);
          // Continue with chat creation anyway
        }
        
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
        
        return true // Chat was created
      }
      return false // Chat already existed
    } catch (error) {
      console.error("Error creating chat:", error)
      // Don't throw error, show user-friendly message
      toast.error("Failed to initialize chat. Please try refreshing the page.")
      return false;
    }
  }

  const handleSubmit = async () => {
    console.log("handleSubmit called", {
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
      console.log("No chat ID, generating temporary ID for testing");
      toast.error("Chat ID is missing - using test ID");
      return;
    }
    
    if (chatState.isLoading) {
      console.log("Already loading, not submitting");
      toast.info("Already processing a message");
      return;
    }
    
    toast.info("Processing your message...")
    console.log("Setting loading state and showing thinking indicator")
    
    setChatState(prevState => ({
      ...prevState,
      isLoading: true,
      error: null
    }))
    setShowThinking(true)
    
    try {
      console.log("Processing value:", value.trim());
      const processedValue = stripPrefixes(value.trim())
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: processedValue,
        timestamp: new Date().toISOString(),
      }
      
      console.log("Created user message:", userMessage);
      const sanitizedUserMessage = sanitizeForDrizzle(userMessage)
      if (!validateMessage(sanitizedUserMessage)) {
        console.error("Invalid message structure:", sanitizedUserMessage);
        throw new Error("Invalid user message structure")
      }
      
      // Use a guest user ID if not authenticated
      const userId = user?.user?.id || "guest-user"
      console.log("Using user ID:", userId);
      
      // Check if chat exists, create if not
      console.log("Checking/creating chat with ID:", chatId);
      const chatCreated = await createChatIfNotExists(chatId, userId)
      
      if (!chatCreated) {
        // Chat creation failed, but don't stop the process
        console.warn("Chat creation may have failed, but continuing...");
      }
      
      console.log("Fetching chat from database with ID:", chatId);
      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId))
      if (chatRows.length === 0) {
        console.error("Chat still not found after creation attempt:", chatId);
        throw new Error("Chat not found. Please refresh the page and try again.")
      }
      
      const chat: any = chatRows[0]
      console.log("Found chat:", chat.id);
      const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages)
      const updatedMessages = [...messages, sanitizedUserMessage]
      
      console.log("Updating chat in database");
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updatedAt: new Date().toISOString(), // Use snake_case
          creatorUid: userId, // Use snake_case
        })
        .where(eq(chatsTable.id, chatId))
      
      console.log("Updating local chat state");
      setChatState(prevState => ({
        ...prevState,
        messages: updatedMessages
      }))
      
      console.log("Clearing input value");
      setValue("")
      
      console.log("Generating AI response");
      await handleAIResponse(processedValue)
    } catch (error) {
      console.error("Error submitting message:", error)
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: "Failed to send message"
      }))
      toast.error("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      if (chatState.error) {
        console.log("Error in chat state, resetting loading and thinking states");
        setChatState(prevState => ({
          ...prevState,
          isLoading: false
        }))
        setShowThinking(false)
      }
    }
  }
  const handleAIResponse = async (userInput: string) => {
    try {
      setChatState(prevState => ({
        ...prevState,
        isLoading: true
      }))
      setShowThinking(true)
      
      const aiResponse = await aiService.generateResponse(userInput)
      
      const assistantMessageBase = {
        id: uuidv4(),
        role: "assistant" as const,
        content: typeof aiResponse === "string" ? aiResponse : aiResponse.text_response,
        timestamp: new Date().toISOString(),
      }

      const assistantMessage: Message = {
        ...assistantMessageBase,
        ...(typeof aiResponse !== "string" && aiResponse.image_urls?.length > 0
          ? { image_urls: aiResponse.image_urls.filter(url => typeof url === "string") } 
          : {}),
      }

      const sanitizedMessage = sanitizeForDrizzle(assistantMessage)
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure")
      }

      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId))
      if (chatRows.length === 0) {
        throw new Error("Chat not found")
      }
      
      const chat: any = chatRows[0]
      const messages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages)
      const updatedMessages = [...messages, sanitizedMessage]
      
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(chatsTable.id, chatId))
      
      setChatState(prevState => ({
        ...prevState,
        messages: updatedMessages,
        isLoading: false
      }))
      setShowThinking(false)
    } catch (error) {
      console.error("Error generating AI response:", error)
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: "Failed to generate AI response"
      }))
      toast.error("Failed to generate AI response")
    } finally {
      setShowThinking(false)
      setChatState(prevState => ({
        ...prevState,
        isLoading: false
      }))
    }
  }
  const handleURLAnalysis = async (
    urls: string[],
    prompt: string,
    type: string = "url_analysis"
  ): Promise<void> => {
    try {
      setChatState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null
      }))
      setShowThinking(true)
      
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: `Analyze this: ${urls.join(", ")} ${prompt ? `\n\n${prompt}` : ""}`,
        timestamp: new Date().toISOString(),
      }

      const sanitizedUserMessage = sanitizeForDrizzle(userMessage)
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure for URL analysis")
      }

      const chatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, sessionId))
      if (chatRows.length === 0) {
        throw new Error("Chat not found")
      }
      
      const chat: any = chatRows[0]
      const currentMessages = Array.isArray(chat.messages) ? chat.messages : JSON.parse(chat.messages)
      const updatedMessages = [...currentMessages, sanitizedUserMessage]
      
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(updatedMessages),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(chatsTable.id, sessionId))

      setChatState(prevState => ({
        ...prevState,
        messages: updatedMessages
      }))
      
      setValue("")
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/analyze_media_from_url`
      const payload = { urls, prompt }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const responseData = await response.json()

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: responseData.response || responseData.text || "Analysis complete.",
        timestamp: new Date().toISOString(),
      }

      const sanitizedMessage = sanitizeForDrizzle(assistantMessage)
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure for URL analysis")
      }

      const updatedChatRows = await db.select().from(chatsTable).where(eq(chatsTable.id, sessionId))
      if (updatedChatRows.length === 0) {
        throw new Error("Chat not found")
      }
      
      const updatedChat: any = updatedChatRows[0]
      const latestMessages = Array.isArray(updatedChat.messages) ? updatedChat.messages : JSON.parse(updatedChat.messages)
      const finalMessages = [...latestMessages, sanitizedMessage]
      
      await db.update(chatsTable)
        .set({
          messages: JSON.stringify(finalMessages),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(chatsTable.id, sessionId))
      
      setChatState(prevState => ({
        ...prevState,
        messages: finalMessages,
        isLoading: false
      }))
      setShowThinking(false)
    } catch (error) {
      console.error("Error in URL analysis:", error)
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to analyze URL content"
      }))
      toast.error("Failed to analyze content")
    } finally {
      setShowThinking(false)
    }
  }
  const handleAIGenerate = useCallback(async (prompt: string, messages: any[] = []) => {
    try {
      setChatState(prevState => ({
        ...prevState,
        isLoading: true
      }))
      setShowThinking(true)
      
      const aiResponse = await aiService.generateResponse(prompt)
      const formattedResponse = typeof aiResponse === "string" 
        ? aiResponse 
        : aiResponse.text_response
      
      setChatState(prevState => ({
        ...prevState,
        isLoading: false
      }))
      setShowThinking(false)
      
      return formattedResponse
    } catch (error) {
      console.error("Error generating AI response:", error)
      setChatState(prevState => ({
        ...prevState,
        isLoading: false,
        error: "Failed to generate AI response"
      }))
      toast.error("Failed to generate AI response")
      return null
    } finally {
      setShowThinking(false)
    }
  }, [])
  const handleAdjustHeight = useCallback(
    (reset = false) => {
      if (!textareaRef.current) return

      if (reset) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`
        setInputHeight(MIN_HEIGHT)
        return
      }

      const scrollHeight = textareaRef.current.scrollHeight
      const newHeight = Math.min(scrollHeight, MAX_HEIGHT)
      textareaRef.current.style.height = `${newHeight}px`
      setInputHeight(newHeight)
    },
    [textareaRef, setInputHeight]
  )


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
        isThinking={chatState.isLoading || showThinking}
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
  )
}
