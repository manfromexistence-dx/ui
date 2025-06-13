import { GoogleGenAI } from "@google/genai";
import { useAIModelStore } from "../store/ai-model-store";

// Add interface for AI model type
export interface AIModel {
  value: string;
  label: string;
}

// Interface for reasoning response
interface ReasoningResponse {
  thinking: string;
  answer: string;
  model_used: string;
}

// Interface for image generation response
export interface ImageGenResponse {
  text_response: string;
  image_urls: string[];
  model_used: string;
}

// Interface for standard response
interface StandardResponse {
  response: string;
  model_used: string;
}

export type AIServiceResponse = string | ImageGenResponse;

export const aiService = {
  // Get the current model from Zustand store
  get currentModel(): string {
    return useAIModelStore.getState().currentModel;
  },

  // Update the model in Zustand store
  setModel(model: string) {
    useAIModelStore.getState().setModel(model);
  },

  async generateResponse(question: string): Promise<AIServiceResponse> {
    try {
      const model = this.currentModel;
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCEWKmjmbmnrNvzxVizTGWlSo1iRACReew" });
      const config = {
        responseMimeType: "text/plain",
      };
      const contents = [
        {
          role: "user",
          parts: [{ text: question }],
        },
      ];
      let fullResponse = "";
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });
      for await (const chunk of response) {
        fullResponse += chunk.text || "";
      }
      
      // Check if the response contains image URLs
      if (fullResponse.includes("http") && (fullResponse.includes(".jpg") || fullResponse.includes(".png"))) {
        // Extract URLs using a simple regex
        const urlRegex = /(https?:\/\/[^\s]+\.(jpg|png|jpeg|gif))/g;
        const matches = fullResponse.match(urlRegex) || [];
        
        return {
          text_response: fullResponse,
          image_urls: matches,
          model_used: model
        };
      }
      
      return fullResponse;
    } catch (error) {
      console.error("Error calling GoogleGenAI:", error);
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    }
  },
};