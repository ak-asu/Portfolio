import {
  CreateMLCEngine,
  type MLCEngineInterface,
  type ChatCompletionMessageParam,
} from "@mlc-ai/web-llm";
import about from "../data/about.json";
import achievements from "../data/achievements.json";
import contact from "../data/contact.json";
import education from "../data/education.json";
import projects from "../data/projects.json";
import skills from "../data/skills.json";
import work from "../data/work.json";

// In-memory model selection (can be made configurable)
let selectedModel = "Llama-3.2-1B-Instruct";
let engine: MLCEngineInterface | null = null;

// In-memory chat history (not persisted)
let chatHistory: { role: "user" | "bot"; content: string }[] = [];

// Data memory (read-only)
const DATA_MEMORY = {
  about,
  achievements,
  contact,
  education,
  projects,
  skills,
  work,
};

// Harmful prompt filter (basic, can be extended)
const HARMFUL_PATTERNS = [
  /\b(kill|suicide|attack|bomb|hack|explosive|murder|abuse|violence|terror)\b/i,
  /<script|<\/script|<img|onerror=|onload=|javascript:/i, // XSS
  /prompt injection|ignore previous|disregard instructions|bypass|jailbreak/i,
  /api[_-]?key|password|secret|token/i,
];

export function isModelLoaded() {
  return !!engine;
}

export async function loadModel(
  modelId?: string,
  progressCallback?: (p: number) => void,
) {
  if (engine) return true;
  selectedModel = modelId || selectedModel;
  try {
    engine = await CreateMLCEngine(selectedModel, {
      initProgressCallback: progressCallback
        ? (report: { progress?: number }) => {
            if (typeof report.progress === "number") {
              progressCallback(report.progress);
            }
          }
        : undefined,
    });
    return true;
  } catch {
    engine = null;
    return false;
  }
}

export function getChatHistory() {
  return chatHistory.slice();
}

export function clearChatHistory() {
  chatHistory = [];
}

function isHarmfulPrompt(text: string): boolean {
  return HARMFUL_PATTERNS.some((pat) => pat.test(text));
}

// Only allow LLM to access DATA_MEMORY
function buildPrompt(
  userMessage: string,
  lastMessages: { role: string; content: string }[],
) {
  // Add relevant data from memory (simple, can be improved with semantic search)
  const memorySummary =
    "You have access ONLY to the following data (summarized):\n" +
    Object.entries(DATA_MEMORY)
      .map(([k, v]) => `${k}: ${JSON.stringify(v).slice(0, 500)}...`)
      .join("\n") +
    "\nDo not answer questions about anything outside this data.";
  const context = lastMessages
    .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
    .join("\n");
  return `${memorySummary}\n\nChat context:\n${context}\n\nUser: ${userMessage}\nBot:`;
}

export async function sendMessageToLLM(
  userMessage: string,
): Promise<{ success: boolean; content: string }> {
  if (!engine) {
    const loaded = await loadModel();
    if (!loaded) {
      return {
        success: false,
        content:
          "Model not loaded. Use Gemini or enable GPU acceleration and try again.",
      };
    }
  }
  if (isHarmfulPrompt(userMessage)) {
    return {
      success: false,
      content: "Your message was blocked due to safety filters.",
    };
  }
  // Only last 3 exchanges (user+bot)
  const lastMessages = chatHistory.slice(-6);
  const memorySystemPrompt = buildPrompt(userMessage, lastMessages);
  try {
    // WebLLM expects OpenAI-style messages
    const historyMsgs: ChatCompletionMessageParam[] = lastMessages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.content,
    }));
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: memorySystemPrompt },
      ...historyMsgs,
      { role: "user", content: userMessage },
    ];
    const eng = engine!;
    const reply = await eng.chat.completions.create({
      messages,
      temperature: 0.8,
      stream: false,
    });
    const content = (reply.choices?.[0]?.message?.content || "").trim();
    chatHistory.push({ role: "user", content: userMessage });
    chatHistory.push({ role: "bot", content });
    return { success: true, content };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return {
      success: false,
      content: `Error: ${errorMessage}. Ensure WebGPU is supported and enabled, then try again or switch to Gemini.`,
    };
  }
}

// Hardware acceleration helpers
export function isWebGPUSupported(): boolean {
  try {
    if (typeof navigator === "undefined") return false;
    // Use feature check via in operator to avoid any casts
    const n = navigator as unknown as { gpu?: unknown };
    return "gpu" in n && n.gpu != null;
  } catch {
    return false;
  }
}

export async function ensureLocalLLMReady(
  modelId?: string,
  progressCallback?: (p: number) => void,
): Promise<boolean> {
  if (!isWebGPUSupported()) return false;
  if (engine) return true;
  return loadModel(modelId, progressCallback);
}

// Optional: probe WebGPU adapter availability (some environments report navigator.gpu but cannot create an adapter)
export async function probeWebGPU(): Promise<boolean> {
  try {
    if (!isWebGPUSupported()) return false;
    const navGpu = (navigator as unknown as { gpu?: unknown }).gpu as
      | {
          requestAdapter: (opts?: {
            powerPreference?: string;
          }) => Promise<unknown>;
        }
      | undefined;
    const adapter = await navGpu?.requestAdapter({
      powerPreference: "high-performance",
    });
    return adapter != null;
  } catch {
    return false;
  }
}
