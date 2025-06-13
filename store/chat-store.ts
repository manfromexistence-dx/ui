// Zustand store for chat input states and comprehensive chat management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message } from '@/types/chat'

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatInputStore {
  // Input value management
  value: string;
  setValue: (v: string) => void;

  // UI state management
  isMaxHeight: boolean;
  setIsMaxHeight: (v: boolean) => void;

  isLoggingIn: boolean;
  setIsLoggingIn: (v: boolean) => void;

  inputHeight: number;
  setInputHeight: (v: number) => void;

  // Feature toggles
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  toggleSearch: () => void;

  showResearch: boolean;
  setShowResearch: (v: boolean) => void;
  toggleResearch: () => void;

  showThinking: boolean;
  setShowThinking: (v: boolean) => void;
  toggleThinking: () => void;

  // Media management
  imagePreview: string | null;
  setImagePreview: (v: string | null) => void;

  // Chat state management
  chatState: ChatState;
  setChatState: (v: ChatState) => void;
  
  // Chat actions
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;

  // Streaming state
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamingMessageId: string | null;
  setStreamingMessageId: (id: string | null) => void;
}

export const useChatInputStore = create<ChatInputStore>()(
  persist(
    (set, get) => ({
      // Input value management
      value: '',
      setValue: (v) => set({ value: v }),

      // UI state management
      isMaxHeight: false,
      setIsMaxHeight: (v) => set({ isMaxHeight: v }),

      isLoggingIn: false,
      setIsLoggingIn: (v) => set({ isLoggingIn: v }),

      inputHeight: 48,
      setInputHeight: (v) => set({ inputHeight: v }),

      // Feature toggles
      showSearch: false,
      setShowSearch: (v) => set({ showSearch: v }),
      toggleSearch: () => set((state) => ({ showSearch: !state.showSearch })),

      showResearch: false,
      setShowResearch: (v) => set({ showResearch: v }),
      toggleResearch: () => set((state) => ({ showResearch: !state.showResearch })),

      showThinking: false,
      setShowThinking: (v) => set({ showThinking: v }),
      toggleThinking: () => set((state) => ({ showThinking: !state.showThinking })),

      // Media management
      imagePreview: null,
      setImagePreview: (v) => set({ imagePreview: v }),

      // Chat state management
      chatState: {
        messages: [],
        isLoading: false,
        error: null,
      },
      setChatState: (v) => set({ chatState: v }),

      // Chat actions
      addMessage: (message) => set((state) => ({
        chatState: {
          ...state.chatState,
          messages: [...state.chatState.messages, message]
        }
      })),

      updateMessage: (messageId, updates) => set((state) => ({
        chatState: {
          ...state.chatState,
          messages: state.chatState.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }
      })),

      setLoading: (loading) => set((state) => ({
        chatState: {
          ...state.chatState,
          isLoading: loading
        }
      })),

      setError: (error) => set((state) => ({
        chatState: {
          ...state.chatState,
          error
        }
      })),

      clearMessages: () => set((state) => ({
        chatState: {
          ...state.chatState,
          messages: []
        }
      })),

      // Streaming state
      isStreaming: false,
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      
      streamingMessageId: null,
      setStreamingMessageId: (id) => set({ streamingMessageId: id }),
    }),
    {
      name: 'friday-chat-storage',
      // Only persist certain non-sensitive data
      partialize: (state) => ({
        showSearch: state.showSearch,
        showResearch: state.showResearch,
        showThinking: state.showThinking,
        inputHeight: state.inputHeight,
      }),
    }
  )
)
