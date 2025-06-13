"use client"

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import { useCategorySidebar } from "@/components/layout/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/layout/sidebar/subcategory-sidebar"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { ChatInput } from "@/components/chat/chat-input"
import { useQueryClient } from "@tanstack/react-query"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { authClient } from "@/lib/auth/auth-client"
import { db } from "@/db"
import { chats as chatsTable, user as userTable } from "@/db/schema" // Fixed import
import { toast } from "sonner"
import { useAIModelStore } from "@/store/ai-model-store"
import { useChatInputStore } from "@/store/chat-store"
import { googleGenAIService } from "@/services/google-genai-service"
import { eq } from "drizzle-orm" // Added missing import


interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

interface AiInputProps {
  onInputChange?: (value: string) => void
  onSubmit?: () => void
}

// Define the ref type for external value updates
export interface AiInputRef {
  setValue: (value: string) => void
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

export const AiInput = forwardRef<AiInputRef, AiInputProps>(function AiInput(
  { onInputChange, onSubmit },
  ref
) {
  const queryClient = useQueryClient()
  const { statecategorysidebar } = useCategorySidebar()
  const { statesubcategorysidebar } = useSubCategorySidebar()
  const router = useRouter()
  const { currentModel, setModel } = useAIModelStore()

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    showSearch,
    showResearch,
    showThinking,
    value,
    imagePreview,
    setValue,
    setImagePreview
  } = useChatInputStore()
  
  const [isMaxHeight, setIsMaxHeight] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Fetch user data on component mount
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

  // Expose the setValue method through ref
  useImperativeHandle(ref, () => ({
    setValue: (newValue: string) => {
      setValue(newValue)
      setTimeout(() => {
        handleAdjustHeight()
      }, 0)
    }
  }))
  
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      router.push("/sign-in")
    } catch (error) {
      console.error("Error redirecting to login:", error)
      toast.error("Failed to redirect to login page")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })

  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT)

  const handleAdjustHeight = useCallback((reset = false) => {
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
  }, [textareaRef])

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  })

  // Debounce input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onInputChange) {
        onInputChange(value)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value, onInputChange])
  
  const handleValueChange = (newValue: string) => {
    setValue(newValue)
  }
  
  const handleUrlAnalysis = (urls: string[], prompt: string) => {
    if (!user || !user.user) {
      toast.error("Authentication required", {
        description: "Please sign in to analyze URLs",
        action: {
          label: isLoggingIn ? "Signing in..." : "Sign In",
          onClick: handleLogin,
        },
        duration: 5000,
      })
      return
    }

    const fullPrompt = `${prompt}: ${urls.join(", ")}`
    handleValueChange(fullPrompt)
  }

  // Add a function to ensure a user exists in the database
  const ensureUserExists = async (userId: string) => {
    try {
      // Check if user exists
      const userExists = await db.select({ id: userTable.id }) // Fixed reference
        .from(userTable) // Fixed reference
        .where(eq(userTable.id, userId)) // Fixed reference
        .then(rows => rows.length > 0);
      
      if (!userExists) {
        console.log(`User ${userId} doesn't exist, creating a guest user`);
        // Create a guest user for testing if none exists
        await db.insert(userTable).values({ // Fixed reference
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
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!value.trim() || chatState.isLoading) return

    if (onSubmit) {
      onSubmit()
    }
    
    try {
      // Generate a test chat ID if creating a new chat
      const chatId = uuidv4()
      const trimmedValue = value.trim()
      
      console.log("Creating new chat with ID:", chatId);

      const initialMessage = {
        id: uuidv4(),
        content: trimmedValue,
        role: "user",
        timestamp: new Date().toISOString()
      }
      
      // Use a guest user ID if not authenticated
      const userId = user?.user?.id || "guest-user";
      
      // Ensure the user exists in the database
      const userCreated = await ensureUserExists(userId);
      if (!userCreated) {
        console.warn("Could not ensure user exists, proceeding anyway");
      }
      
      // Check if the chat already exists in the database (just in case)
      const existingChat = await db.select()
        .from(chatsTable)
        .where(eq(chatsTable.id, chatId));
      
      if (existingChat.length > 0) {
        console.log("Chat already exists with this ID, using existing chat");
        toast.info("Using existing chat");
      } else {
        console.log("Creating new chat with ID:", chatId);
        
        const chatData = {
          id: chatId,
          title: trimmedValue.slice(0, 50) + (trimmedValue.length > 50 ? "..." : ""),
          messages: JSON.stringify([initialMessage]),
          model: currentModel,
          visibility: "public" as const,
          createdAt: new Date().toISOString(), // Use snake_case
          updatedAt: new Date().toISOString(), // Use snake_case
          creatorUid: userId, // Use snake_case
          reactions: JSON.stringify({
            likes: {},
            dislikes: {}
          }),
          participants: JSON.stringify([userId]),
          views: 0,
          uniqueViewers: JSON.stringify([]),
          isPinned: false // Changed from 0 to false for boolean field
        }
        
        // Log before insert
        console.log("Inserting chat data:", chatData);
        
        try {
          await db.insert(chatsTable).values(chatData)
          console.log("Successfully created chat");
        } catch (dbError) {
          console.error("Database error creating chat:", dbError);
          toast.error("Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error"));
          return;
        }
      }

      sessionStorage.setItem("initialPrompt", trimmedValue)
      sessionStorage.setItem("selectedAI", currentModel)
      sessionStorage.setItem("chatId", chatId)
      sessionStorage.setItem("autoSubmit", "true")

      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Error:", error)
      setChatState(prev => ({
        ...prev,
        error: "Failed to create chat"
      }))
      toast.error("Failed to create chat: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const generateAIResponse = async (prompt: string, messages: any[] = []) => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true }))

      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }))

      formattedMessages.push({
        role: 'user',
        parts: [{ text: prompt }]
      })

      const response = await googleGenAIService.generateContentStream(
        currentModel,
        formattedMessages
      )

      return response
    } catch (error) {
      console.error('Error generating AI response:', error)
      setChatState(prev => ({
        ...prev,
        error: 'Failed to generate AI response. Please try again.',
        isLoading: false
      }))
      throw error
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleAIGenerate = async (prompt: string, messages: any[] = []) => {
    return await generateAIResponse(prompt, messages)
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center transition-[left,right,width,margin-right] duration-200 ease-linear">
      <ChatInput
        value={value}
        chatState={chatState}
        setChatState={setChatState}
        imagePreview={imagePreview}
        inputHeight={inputHeight}
        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
        onSubmit={handleSubmit}
        onChange={handleValueChange}
        onHeightChange={handleAdjustHeight}
        onUrlAnalysis={handleUrlAnalysis}
        onAIGenerate={handleAIGenerate}
        onImageChange={(file) =>
          file ? setImagePreview(URL.createObjectURL(file)) : setImagePreview(null)
        }
      />
    </div>
  )
})
