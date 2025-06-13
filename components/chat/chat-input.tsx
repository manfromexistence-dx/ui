import * as React from "react"
import { cn } from "@/lib/utils"
import { ChatState } from "@/types/chat"
import { Textarea } from "@/components/ui/textarea"
import { InputActions } from "@/components/chat/input-actions"
import { ImagePreview } from "@/components/chat/image-preview"
import { useAIModelStore } from "@/store/ai-model-store"
import { useToast } from "@/hooks/use-toast"
import { motion, useAnimationControls } from "framer-motion"
import { ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const MotionTextarea = motion.create(Textarea)

export interface ChatInputProps {
  className?: string
  value: string
  chatState: ChatState
  setChatState?: React.Dispatch<React.SetStateAction<ChatState>>
  imagePreview?: string | null
  inputHeight?: number
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onSubmit: () => void
  onChange: (value: string) => void
  onHeightChange?: (reset?: boolean) => void
  onImageChange?: (file: File | null) => void
  onUrlAnalysis?: (urls: string[], prompt: string, type?: string) => void
  onImageGeneration?: (response: { text: string; image: string; model_used: string; file_path: string }) => void
  onAIGenerate?: (prompt: string, messages?: any[]) => Promise<any>
}

interface ImagePreviewProps {
  imagePreview: string
  inputHeight: number
  onRemove: () => void
}

export function ChatInput({
  className,
  value,
  chatState,
  imagePreview,
  inputHeight,
  textareaRef,
  onSubmit,
  onChange,
  onHeightChange,
  onImageChange,
  onUrlAnalysis,
  onImageGeneration,
  onAIGenerate,
}: ChatInputProps) {
  const { currentModel } = useAIModelStore()
  const { toast } = useToast()

  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false)
  const [initialHeight, setInitialHeight] = React.useState(0)
  const [isMobileDevice, setIsMobileDevice] = React.useState(false)
  const [historyMessages, setHistoryMessages] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [tempValue, setTempValue] = React.useState("")
  const [activeCommand, setActiveCommand] = React.useState<string | null>(null)
  const [contentWithoutPrefix, setContentWithoutPrefix] = React.useState("")
  const [textareaHeight, setTextareaHeight] = React.useState<number>(0)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  
  const controls = useAnimationControls()
  const minHeight = 60

  // Extract user messages from chatState for history navigation
  React.useEffect(() => {
    if (chatState?.messages?.length > 0) {
      const userMessages = chatState.messages
        .filter(msg => msg.role === "user")
        .map(msg => msg.content)

      if (JSON.stringify(userMessages) !== JSON.stringify(historyMessages)) {
        setHistoryMessages(userMessages)
      }
    }
  }, [chatState.messages, historyMessages])

  // Detect if device is mobile on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ""
      const isMobileByUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const isNarrowScreen = window.innerWidth <= 768

      const mobileDetected = [isMobileByUA, isTouchScreen, isNarrowScreen].filter(Boolean).length >= 2
      setIsMobileDevice(mobileDetected)
    }
  }, [])

  // Detect mobile keyboard
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setInitialHeight(window.innerHeight)

      const handleResize = () => {
        const heightDifference = initialHeight - window.innerHeight
        const heightChangePercentage = (heightDifference / initialHeight) * 100

        if (heightChangePercentage > 25) {
          setIsKeyboardVisible(true)
        } else {
          setIsKeyboardVisible(false)
        }
      }

      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement
        if (target.id === "ai-input" && isMobileDevice) {
          setTimeout(() => setIsKeyboardVisible(true), 100)
        }
      }

      const handleBlur = () => {
        setTimeout(() => setIsKeyboardVisible(false), 100)
      }

      window.addEventListener("resize", handleResize)
      document.addEventListener("focusin", handleFocus)
      document.addEventListener("focusout", handleBlur)

      return () => {
        window.removeEventListener("resize", handleResize)
        document.removeEventListener("focusin", handleFocus)
        document.removeEventListener("focusout", handleBlur)
      }
    }
  }, [initialHeight, isMobileDevice])

  // Dynamically apply positioning classes based on keyboard visibility AND device type
  const positioningClasses = React.useMemo(() => {
    return isMobileDevice && isKeyboardVisible
      ? "fixed bottom-2" 
      : ""
  }, [isKeyboardVisible, isMobileDevice])

  // Load the active command from localStorage on component mount
  React.useEffect(() => {
    const savedCommand = localStorage.getItem("activeCommand")
    if (savedCommand) {
      setActiveCommand(savedCommand)

      const prefixes = {
        "image-gen": "Image",
        "thinking-mode": "Thinking",
        "search-mode": "Search",
        "research-mode": "Research",
        "canvas-mode": "Canvas"
      }

      const prefix = prefixes[savedCommand as keyof typeof prefixes]
      if (prefix && !value.startsWith(prefix)) {
        onChange(`${prefix}: ${value}`)
      }
    }
  }, [onChange, value])

  // Handle empty value with active command
  React.useEffect(() => {
    if (value === "" && activeCommand) {
      const prefixes = {
        "image-gen": "Image",
        "thinking-mode": "Thinking",
        "search-mode": "Search",
        "research-mode": "Research",
        "canvas-mode": "Canvas"
      }

      const prefix = prefixes[activeCommand as keyof typeof prefixes]
      if (prefix) {
        setTimeout(() => {
          onChange(`${prefix}: `)
        }, 50)
      }
    }
  }, [value, activeCommand, onChange])

  // Handle inserting special text
  const handleInsertText = (text: string, type: string) => {
    if (!text) {
      setActiveCommand(null)
      localStorage.removeItem("activeCommand")
      onChange("")
      return
    }

    setActiveCommand(type)
    localStorage.setItem("activeCommand", type)

    const newText = text.endsWith(":") ? text + " " : text
    onChange(newText)

    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
        const cursorPosition = newText.length
        textareaRef.current.selectionStart = cursorPosition
        textareaRef.current.selectionEnd = cursorPosition
      }, 0)
    }
  }

  // Function to navigate message history
  const navigateHistory = (direction: "up" | "down"): void => {
    if (historyMessages.length === 0) return

    if (historyIndex === -1 && direction === "up") {
      setTempValue(value)
    }

    if (direction === "up") {
      if (historyIndex < historyMessages.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        onChange(historyMessages[historyMessages.length - 1 - newIndex])
      }
    } else {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        onChange(historyMessages[historyMessages.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        onChange(tempValue)
      }
    }
  }

  // Special handler for keydown events in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.currentTarget.selectionStart || 0
    const isAtStart = cursorPosition === 0
    const isAtEnd = cursorPosition === value.length

    // Handle up arrow key for history navigation when cursor is at the start
    if (e.key === "ArrowUp" && isAtStart && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      navigateHistory("up")
      return
    }

    // Handle down arrow key for history navigation when cursor is at the end
    if (e.key === "ArrowDown" && isAtEnd && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      navigateHistory("down")
      return
    }

    // Handle Enter key for submission
    if (e.key === "Enter" && !e.shiftKey && !chatState.isLoading) {
      e.preventDefault()
      if (value.trim()) {
        console.log("Enter key pressed, submitting message");
        console.log("Current value:", value.trim());
        console.log("Chat state:", chatState);
        
        const currentCommand = activeCommand
        setHistoryIndex(-1)

        if (activeCommand) {
          const prefixes = {
            "image-gen": "Image: ",
            "thinking-mode": "Thinking: ",
            "search-mode": "Search: ",
            "research-mode": "Research: ",
            "canvas-mode": "Canvas: "
          }

          const prefix = prefixes[activeCommand as keyof typeof prefixes]
          if (prefix && value.startsWith(prefix)) {
            const contentWithoutPrefix = value.substring(prefix.length)
            const originalValue = value
            onChange(contentWithoutPrefix)

            setTimeout(() => {
              console.log("Submitting message without prefix:", contentWithoutPrefix);
              onSubmit()
              setTimeout(() => {
                onChange(originalValue)
              }, 0)
            }, 0)
          } else {
            console.log("Submitting message with command:", activeCommand);
            onSubmit()
          }
        } else {
          console.log("Submitting message without command");
          onSubmit()
        }

        if (currentCommand) {
          localStorage.setItem("activeCommand", currentCommand)
        }
        return
      }
    }

    // Special handling for backspace when at or within command text
    if (e.key === "Backspace" && activeCommand) {
      const commandTexts = {
        "image-gen": "Image: ",
        "thinking-mode": "Thinking: ",
        "search-mode": "Search: ",
        "research-mode": "Research: ",
        "canvas-mode": "Canvas: ",
      }
      const commandText = commandTexts[activeCommand as keyof typeof commandTexts]
      const cursorPosition = textareaRef.current?.selectionStart ?? 0

      if (value.startsWith(commandText) && cursorPosition <= commandText.length) {
        e.preventDefault()
        toast({
          title: `${commandText.trim()} Mode Disabled`,
          description: `Reverted to default AI model`,
          variant: "default",
        })
        onChange("")
        setActiveCommand(null)
        localStorage.removeItem("activeCommand")
      }
    }
  }

  // Handle textarea height adjustments
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`
      const scrollHeight = textareaRef.current.scrollHeight
      const targetHeight = value.length < 20 ? minHeight : Math.min(scrollHeight, 300)
      
      setTextareaHeight(targetHeight)
      
      controls.start({
        height: targetHeight,
        transition: { duration: 0.15 }
      })
      
      textareaRef.current.style.height = `${targetHeight}px`
    }
  }, [value, controls, minHeight, textareaRef])

  // Update indicator position on scroll
  React.useEffect(() => {
    if (textareaRef.current && activeCommand) {
      const textarea = textareaRef.current
      const handleScroll = () => setTextareaHeight(prev => prev)
      
      textarea.addEventListener("scroll", handleScroll)
      return () => textarea.removeEventListener("scroll", handleScroll)
    }
  }, [activeCommand, textareaRef])

  // Add scroll to bottom function
  const scrollToBottom = React.useCallback(() => {
    const messageContainer = document.querySelector(".message-list-container")
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight + 2000
      setShowScrollButton(false)
    }
  }, [])

  // Check if we need to show the scroll button
  React.useEffect(() => {
    const handleScroll = () => {
      const messageContainer = document.querySelector(".message-list-container")
      if (messageContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messageContainer
        const nearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!nearBottom)
      }
    }

    const messageContainer = document.querySelector(".message-list-container")
    if (messageContainer) {
      messageContainer.addEventListener("scroll", handleScroll)
      return () => messageContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className={cn("relative z-10 w-[95%] rounded-2xl border shadow-md xl:w-1/2 dark:shadow-none", positioningClasses, className)}>
      <Button
        onClick={scrollToBottom}
        className={cn(
          "absolute -top-12 left-1/2 size-12 -translate-x-1/2 rounded-full p-0 shadow-lg transition-all duration-300",
          showScrollButton ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
        size="icon"
        variant="outline"
      >
        <ChevronDown className="size-7" />
      </Button>

      {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          inputHeight={inputHeight || 0}
          onRemove={() => onImageChange && onImageChange(null)}
        />
      )}

      <div className="relative flex flex-col rounded-2xl">
        <div className="w-full h-12 border-b px-3 text-sm flex flex-row space-x-1 items-center justify-start">
          <div className="h-8 w-8 rounded-md relative broder">
            <img src="/Doraemon.jpg" className="h-full w-full rounded-md" />
            <div className="h-5 w-5 rounded-full border absolute -top-2.5 -right-2.5 flex items-center justify-center hover:bg-primary-foreground">
              <X className="h-3 w-3" />
            </div>
          </div>
        </div>

        <div className="relative">
          <MotionTextarea
            id="ai-input"
            value={value}
            placeholder="Ask me anything..."
            disabled={chatState.isLoading}
            className={cn(
              "w-full resize-none border-none p-3 leading-normal tracking-wider focus-visible:ring-0 text-sm !bg-background",
              chatState.isLoading && "opacity-50",
              activeCommand && "first-line-visible text-opacity-0"
            )}
            ref={textareaRef}
            animate={controls}
            initial={{ height: minHeight }}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              onChange(e.target.value)
              onHeightChange && onHeightChange()

              const prefixes = {
                "image-gen": "Image: ",
                "thinking-mode": "Thinking: ",
                "search-mode": "Search: ",
                "research-mode": "Research: ",
                "canvas-mode": "Canvas: "
              }

              if (activeCommand) {
                const prefix = prefixes[activeCommand as keyof typeof prefixes]
                if (e.target.value.startsWith(prefix)) {
                  setContentWithoutPrefix(e.target.value.substring(prefix.length))
                } else {
                  setActiveCommand(null)
                  localStorage.removeItem("activeCommand")
                  setContentWithoutPrefix("")
                }
              }

              // Check if command prefix is still valid
              if (activeCommand === "image-gen" && !e.target.value.startsWith("Image: ")) {
                setActiveCommand(null)
                localStorage.removeItem("activeCommand")
              } else if (activeCommand === "thinking-mode" && !e.target.value.startsWith("Thinking: ")) {
                setActiveCommand(null)
                localStorage.removeItem("activeCommand")
              } else if (activeCommand === "search-mode" && !e.target.value.startsWith("Search: ")) {
                setActiveCommand(null)
                localStorage.removeItem("activeCommand")
              } else if (activeCommand === "research-mode" && !e.target.value.startsWith("Research: ")) {
                setActiveCommand(null)
                localStorage.removeItem("activeCommand")
              } else if (activeCommand === "canvas-mode" && !e.target.value.startsWith("Canvas: ")) {
                setActiveCommand(null)
                localStorage.removeItem("activeCommand")
              }

              // Reset history navigation index when manually typing
              setHistoryIndex(-1)
            }}
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: "300px",
              overflowY: "auto",
              lineHeight: "1.5",
            }}
          />
        </div>
        
        <InputActions
          onSubmit={onSubmit}
          onImageUpload={(file: File | null) => onImageChange && onImageChange(file)}
          onUrlAnalysis={onUrlAnalysis}
          onInsertText={handleInsertText}
          onAIGenerate={onAIGenerate}
        />
      </div>
    </div>
  )
}
