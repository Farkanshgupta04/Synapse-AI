import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Paperclip, ArrowUp, Globe, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { apiUrl } from "../config";
import { API_CONFIG } from "../config";

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  MODEL: 'auth_model',
  TEMPERATURE: 'auth_temperature',
  SESSIONS: (userId) => `chat_sessions_${userId}`,
  ACTIVE_SESSION: (userId) => `active_chat_session_${userId}`,
  HISTORY: (userId, sessionId) => `promtHistory_${userId}_${sessionId}`,
};

const LEGACY_KEYS = {
  TOKEN: 'token',
};

const PROMPT_TEMPLATES = [
  {
    title: 'Explain code',
    prompt: 'Explain this code in simple terms and point out any risks or improvements.',
  },
  {
    title: 'Generate tests',
    prompt: 'Create a focused test plan for this feature, including edge cases.',
  },
  {
    title: 'Refactor help',
    prompt: 'Suggest a cleaner refactor for this code while keeping behavior the same.',
  },
  {
    title: 'Product thinking',
    prompt: 'Help me improve this feature with one practical product change and one technical change.',
  },
];

const createSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const truncateText = (text, maxLength = 64) => {
  if (!text) return 'New Chat';
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
};

const getUserId = () => {
  const user = parseJson(localStorage.getItem(STORAGE_KEYS.USER), null);
  return user?._id || user?.id || null;
};

const readSessions = (userId) => parseJson(localStorage.getItem(STORAGE_KEYS.SESSIONS(userId)), []);

const writeSessions = (userId, sessions) => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS(userId), JSON.stringify(sessions));
};

const readHistory = (userId, sessionId) => parseJson(localStorage.getItem(STORAGE_KEYS.HISTORY(userId, sessionId)), []);

const writeHistory = (userId, sessionId, messages) => {
  localStorage.setItem(STORAGE_KEYS.HISTORY(userId, sessionId), JSON.stringify(messages));
};

const buildSessionMeta = (session, messages) => {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const lastMessage = messages[messages.length - 1];
  const baseTitle = session?.title && session.title !== 'New Chat'
    ? session.title
    : truncateText(firstUserMessage?.content || lastMessage?.content || 'New Chat', 36);

  return {
    id: session.id,
    title: baseTitle,
    preview: truncateText(lastMessage?.content || 'Start a conversation', 72),
    pinned: Boolean(session.pinned),
    updatedAt: new Date().toISOString(),
  };
};

const createDefaultSession = () => ({
  id: createSessionId(),
  title: 'New Chat',
  preview: 'Start a conversation',
  pinned: false,
  updatedAt: new Date().toISOString(),
});

function Promt() {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [model, setModel] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.MODEL) || API_CONFIG.AI_DEFAULTS.MODEL;
  });
  const [temperature, setTemperature] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPERATURE);
    return saved ? Number(saved) : API_CONFIG.AI_DEFAULTS.TEMPERATURE;
  });

  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const userId = getUserId();
    return userId ? localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION(userId)) : null;
  });
  const abortControllerRef = useRef(null);
  const chatScrollRef = useRef(null);
  const promtEndRef = useRef();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);
  const shouldFocusInputRef = useRef(false);

  const clearAttachments = () => {
    setSelectedImages([]);
    setImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    const sessions = readSessions(userId);
    const legacyHistory = parseJson(localStorage.getItem(`promtHistory_${userId}`), null);

    if (sessions.length === 0) {
      const firstSession = createDefaultSession();
      writeSessions(userId, [firstSession]);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), firstSession.id);

      if (legacyHistory?.length) {
        writeHistory(userId, firstSession.id, legacyHistory);
        setPromt(legacyHistory);
        localStorage.removeItem(`promtHistory_${userId}`);
      } else {
        setPromt([]);
      }

      setActiveSessionId(firstSession.id);
      window.dispatchEvent(new CustomEvent('chat:sessions-changed'));
      window.dispatchEvent(new CustomEvent('chat:session-selected', { detail: { sessionId: firstSession.id } }));
      return;
    }

    const storedActiveSessionId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION(userId)) || sessions[0].id;
    const currentHistory = readHistory(userId, storedActiveSessionId);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), storedActiveSessionId);
    setActiveSessionId(storedActiveSessionId);
    setPromt(currentHistory);
    if (!sessions.find((session) => session.id === storedActiveSessionId)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), sessions[0].id);
      setActiveSessionId(sessions[0].id);
      setPromt(readHistory(userId, sessions[0].id));
    }
  }, []);

  useEffect(() => {
    const userId = getUserId();
    if (!userId || !activeSessionId) return;

    writeHistory(userId, activeSessionId, promt);

    const sessions = readSessions(userId);
    const nextSessions = sessions.map((session) => {
      if (session.id !== activeSessionId) return session;
      return buildSessionMeta(session, promt);
    });

    if (nextSessions.length > 0) {
      writeSessions(userId, nextSessions);
      window.dispatchEvent(new CustomEvent('chat:sessions-changed'));
    }
  }, [promt, activeSessionId]);

  useEffect(() => {
    const handleSessionSelected = (event) => {
      const userId = getUserId();
      const nextSessionId = event.detail?.sessionId;
      if (!userId || !nextSessionId) return;

      clearAttachments();
      shouldFocusInputRef.current = true;
      setActiveSessionId(nextSessionId);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), nextSessionId);
      const nextHistory = readHistory(userId, nextSessionId);
      setPromt(nextHistory);
      shouldScrollToBottomRef.current = nextHistory.length > 0;
      setError("");
    };

    const handleSessionsChanged = () => {
      const userId = getUserId();
      if (!userId) return;

      const sessions = readSessions(userId);
      if (sessions.length === 0) {
        setPromt([]);
        return;
      }

      const storedActiveSessionId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION(userId)) || sessions[0].id;
      if (storedActiveSessionId !== activeSessionId) {
        clearAttachments();
        setActiveSessionId(storedActiveSessionId);
        setPromt(readHistory(userId, storedActiveSessionId));
      }
    };

    window.addEventListener('chat:session-selected', handleSessionSelected);
    window.addEventListener('chat:sessions-changed', handleSessionsChanged);
    window.addEventListener('storage', handleSessionsChanged);

    return () => {
      window.removeEventListener('chat:session-selected', handleSessionSelected);
      window.removeEventListener('chat:sessions-changed', handleSessionsChanged);
      window.removeEventListener('storage', handleSessionsChanged);
    };
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
  }, [model]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPERATURE, String(temperature));
  }, [temperature]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }

      if (shouldFocusInputRef.current) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
        shouldFocusInputRef.current = false;
      }

      shouldScrollToBottomRef.current = false;
      return;
    }

    const isEmptyChat = promt.length === 0 && !loading;

    if (isEmptyChat) {
      chatScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    promtEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [promt, loading, activeSessionId]);

  const ensureActiveSession = () => {
    const userId = getUserId();
    if (!userId) return null;

    if (activeSessionId) return activeSessionId;

    const session = createDefaultSession();
    const sessions = readSessions(userId);
    const nextSessions = [session, ...sessions];
    writeSessions(userId, nextSessions);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), session.id);
    setActiveSessionId(session.id);
    setPromt([]);
    window.dispatchEvent(new CustomEvent('chat:sessions-changed'));
    window.dispatchEvent(new CustomEvent('chat:session-selected', { detail: { sessionId: session.id } }));
    return session.id;
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const currentSessionId = ensureActiveSession();
    if (!currentSessionId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setInputValue("");
    setTypeMessage(trimmed);
    setLoading(true);
    setError("");

    const userMessage = { role: 'user', content: trimmed };
    if (imagePreviews && imagePreviews.length) userMessage.images = [...imagePreviews];

    setPromt((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);

    const assistantIndex = promt.length + 1;

    try {
      // If an image is attached, use the non-stream endpoint and send multipart/form-data
      if (selectedImages && selectedImages.length) {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(LEGACY_KEYS.TOKEN);
        const formData = new FormData();
        formData.append('content', trimmed);
        formData.append('model', model);
        formData.append('temperature', temperature);
        selectedImages.forEach((file) => formData.append('images', file));

        const { data } = await axios.post(apiUrl('/synapse-ai/promt'), formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const aiReply = data.reply || '';
        setPromt((prev) => {
          const next = [...prev];
          next[assistantIndex] = { role: 'assistant', content: aiReply };
          return next;
        });

        // Clear images after send
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setSelectedImages([]);
        setImagePreviews([]);
        setInputValue("");
        return;
      }

      const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(LEGACY_KEYS.TOKEN);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(apiUrl("/synapse-ai/promt/stream"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ content: trimmed, model, temperature }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          const event = JSON.parse(payload);
          if (event.type === "chunk") {
            streamedText += event.content;
            setPromt((prev) => {
              const next = [...prev];
              next[assistantIndex] = { role: "assistant", content: streamedText };
              return next;
            });
          }

          if (event.type === "done") {
            streamedText = event.reply || streamedText;
            setPromt((prev) => {
              const next = [...prev];
              next[assistantIndex] = { role: "assistant", content: streamedText };
              return next;
            });
          }

          if (event.type === "error") {
            throw new Error(event.message || "Failed to process prompt");
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setPromt((prev) => {
          const next = [...prev];
          if (next[assistantIndex]) {
            const existingContent = next[assistantIndex].content || "";
            next[assistantIndex] = {
              role: "assistant",
              content: `${existingContent}\n\n[Generation stopped]`.trim(),
            };
          }
          return next;
        });
        return;
      }

      console.error("API Error:", error);
      let errorMsg = "Something went wrong with the AI response.";
      
      if (error?.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      setPromt((prev) => {
        const next = [...prev];
        if (next[assistantIndex]) {
          const existingContent = next[assistantIndex].content || "";
          next[assistantIndex] = {
            role: "assistant",
            content: existingContent
              ? `${existingContent}\n\n❌ ${errorMsg}`
              : `❌ ${errorMsg}`,
          };
        }
        return next;
      });
    } finally {
      setLoading(false);
      setTypeMessage(null);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyTemplate = (prompt) => {
    setInputValue(prompt);
  };

  const handleCopyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (copyError) {
      console.error("Copy failed:", copyError);
    }
  };

  return (
    <div className="flex h-full w-full max-w-5xl flex-col px-4 pb-4 pt-3 md:px-6 md:pb-8 md:pt-6">
      {/* ➤ Scrollable Chat Box */}
      <div ref={chatScrollRef} className="w-full flex-1 overflow-y-auto scroll-smooth py-4 space-y-4 px-1 hide-scrollbar">
        {/* ➤ Greeting Section */}
        <div className="flex-shrink-0 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <img src="/logo.png" alt="DeepSeek Logo" className="h-8 w-8 md:h-10 md:w-10" />
            <h1 className="text-2xl font-semibold text-white md:text-3xl">
              Hi, I'm Synapse AI.
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-400 md:text-base">
            💬 How can I help you today?
          </p>
        </div>

        {promt.length === 0 && !loading ? (
          <div className="mx-auto w-full max-w-5xl space-y-6 pt-2">
            <div className="rounded-3xl border border-gray-700 bg-[#202024] p-5 shadow-lg shadow-black/20 md:p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="rounded-2xl bg-blue-600/20 p-3 text-blue-300">
                  <Bot className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold md:text-xl">Start with a prompt</h2>
                  <p className="text-sm text-gray-400 md:text-base">Pick a template or type your own multi-line request.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {PROMPT_TEMPLATES.map((template) => (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => handleApplyTemplate(template.prompt)}
                    className="rounded-2xl border border-gray-700 bg-[#17171a] p-4 text-left transition hover:border-blue-500 hover:bg-blue-500/10"
                  >
                    <div className="text-sm font-medium text-gray-100 md:text-base">{template.title}</div>
                    <div className="mt-1 text-sm text-gray-400 md:text-[15px]">{template.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-700 bg-[#17171a] p-4 text-sm text-gray-400">
              Tip: press <span className="font-semibold text-gray-200">Enter</span> to send, <span className="font-semibold text-gray-200">Shift+Enter</span> for a new line.
            </div>
          </div>
        ) : (
          promt.map((msg, index) => (
            <div
              key={index}
              className={`w-full flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="w-full bg-[#232323] text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap relative group">
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.content, index)}
                    className="absolute right-3 top-3 rounded-md border border-gray-600 bg-black/20 p-2 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:text-white"
                    aria-label="Copy response"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={codeTheme}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg mt-2"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code
                            className="bg-gray-800 px-1 py-0.5 rounded"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="max-w-[85%] rounded-xl bg-blue-600 px-4 py-3 text-sm whitespace-pre-wrap text-white shadow-md md:max-w-[70%]">
                  {msg.images && msg.images.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 gap-2">
                      {msg.images.map((src, idx) => (
                        <img key={idx} src={src} alt={`uploaded-${idx}`} className="max-h-48 w-full object-contain rounded" />
                      ))}
                    </div>
                  )}
                  {msg.content}
                </div>
              )}
            </div>
          ))
        )}

        {/* Show user's prompt while loading */}
        {loading && typeMessage && (
          <div
            className="whitespace-pre-wrap px-4 py-3 rounded-2xl text-sm break-words
           bg-blue-600 text-white self-end ml-auto max-w-[40%]"
          >
            {typeMessage}
          </div>
        )}

        {/* 🤖 Typing Indicator */}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-[#2f2f2f] text-white px-4 py-3 rounded-xl text-sm animate-pulse">
              🤖Loading...
            </div>
          </div>
        )}

        <div ref={promtEndRef} />
      </div>

      {/* ➤ Input Box */}
      <div className="sticky bottom-0 z-10 w-full flex-shrink-0 bg-[#1e1e1e] pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="rounded-[2rem] bg-[#2f2f2f] px-4 py-5 shadow-md md:px-6 md:py-7">
          <textarea
            ref={inputRef}
            rows={3}
            placeholder="💬 Type Message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[88px] w-full resize-none rounded-2xl bg-transparent text-base text-white outline-none placeholder-gray-400 md:min-h-[96px] md:text-lg"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {PROMPT_TEMPLATES.map((template) => (
              <button
                key={template.title}
                type="button"
                onClick={() => handleApplyTemplate(template.prompt)}
                className="rounded-full border border-gray-600 px-3 py-1.5 text-xs text-gray-200 transition hover:border-blue-500 hover:bg-blue-500/10"
              >
                {template.title}
              </button>
            ))}
          </div>

          {imagePreviews && imagePreviews.length > 0 && (
            <div className="mt-4 inline-flex max-w-full self-start overflow-x-auto hide-scrollbar rounded-2xl border border-gray-700 bg-[#1b1b1b] p-2">
              <div className="flex w-fit gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                    <img src={src} alt={`preview-${i}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/50 px-1 text-white transition hover:bg-black/75"
                      onClick={() => {
                        setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
                        setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
                        URL.revokeObjectURL(src);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            {/* 🛠️ Functional Buttons */}
            <div className="flex gap-2 flex-wrap items-center">
              <button
                type="button"
                onClick={() => setModel(API_CONFIG.AI_MODELS.GEMINI_FLASH)}
                className={`flex items-center gap-2 border text-sm md:text-base px-3 py-1.5 rounded-full transition ${
                  model === API_CONFIG.AI_MODELS.GEMINI_FLASH
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <Bot className="w-4 h-4" />
                Flash
              </button>
              <button
                type="button"
                onClick={() => setModel(API_CONFIG.AI_MODELS.GEMINI_PRO)}
                className={`flex items-center gap-2 border text-sm md:text-base px-3 py-1.5 rounded-full transition ${
                  model === API_CONFIG.AI_MODELS.GEMINI_PRO
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <Globe className="w-4 h-4" />
                Pro
              </button>
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <span>Temp</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-28"
                />
                <span>{temperature.toFixed(1)}</span>
              </label>
            </div>

            {/* ➤ Send Button */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="inline-flex cursor-pointer items-center text-gray-400 transition hover:text-white">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                      setSelectedImages((prev) => [...prev, ...files]);
                      const newPreviews = files.map((f) => URL.createObjectURL(f));
                      setImagePreviews((prev) => [...prev, ...newPreviews]);
                    }
                  }}
                />
                <Paperclip className="w-5 h-5" />
              </label>
              {loading && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="rounded-full border border-red-400/60 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20 transition"
                >
                  Stop
                </button>
              )}
              <button
                onClick={handleSend}
                className="bg-gray-500 hover:bg-blue-600 p-2 rounded-full text-white transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promt;