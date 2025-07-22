import { REQUEST_TIMEOUT_MS } from "../../constant";
import { ChatOptions, getHeaders, LLMApi, LLMModel, LLMUsage, LLMConfig } from "../api";
import { getClientConfig } from "../../config/client";

export interface MSSQLConfig {
  baseUrl: string;
  apiKey?: string;
}

export class MSSQLApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    // In a web deployment (like Vercel), a relative path is all we need.
    return path;
  }

  extractMessage(res: any) {
    // Extract message from our MSSQL API response
    if (res?.answer) {
      return res.answer;
    }
    return res?.message || "Erro na resposta da API";
  }

  async chat(options: ChatOptions) {
    const config = options.config as LLMConfig & { messages: any[] };
    const messages = config.messages || [];
    const lastMessage = messages[messages.length - 1];
    
    // Extract user question from the last message
    let question = "";
    if (typeof lastMessage?.content === "string") {
      question = lastMessage.content;
    } else if (Array.isArray(lastMessage?.content)) {
      // Handle multimodal content - extract text
      const textContent = lastMessage.content.find((c: any) => c.type === "text");
      question = textContent?.text || "";
    }

    const requestPayload = {
      question: question
    };

    console.log("[MSSQL API] Sending request:", requestPayload);

    const shouldStream = !!config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path("/api/chat");
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders(),
        },
      };

      // Make request to our MSSQL API
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      const res = await fetch(chatPath, chatPayload);
      clearTimeout(requestTimeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const resJson = await res.json();
      console.log("[MSSQL API] Response:", resJson);

      const message = this.extractMessage(resJson);

      // Simulate streaming if requested
      if (shouldStream) {
        // Split message into chunks for streaming effect
        const chunks = message.split(' ');
        let currentMessage = '';
        
        for (let i = 0; i < chunks.length; i++) {
          currentMessage += (i > 0 ? ' ' : '') + chunks[i];
          options.onUpdate?.(currentMessage, currentMessage);
          
          // Add small delay for streaming effect
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Final response
      options.onFinish(message, {
        ...res,
        json: () => Promise.resolve(resJson),
      } as any);

    } catch (e) {
      console.error("[MSSQL API] Error:", e);
      options.onError?.(e as Error);
    }
  }

  async speech(options: any): Promise<ArrayBuffer> {
    throw new Error("Speech not supported in MSSQL API");
  }

  async usage(): Promise<LLMUsage> {
    return {
      used: 0,
      total: 0,
    };
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return [];
    }

    return [
      {
        name: "mssql-chatbot",
        available: true,
        sorted: 1,
        provider: {
          id: "mssql",
          providerName: "MSSQL",
          providerType: "mssql",
          sorted: 1,
        },
      },
    ];
  }
}

export { MSSQLApi as ChatGPTApi };
