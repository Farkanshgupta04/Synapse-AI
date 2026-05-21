import React, { useEffect, useMemo, useRef, useState } from "react";
import { LogOut, X, Search, Plus, Pin, PinOff, Download, Trash2, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config";

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  SESSIONS: (userId) => `chat_sessions_${userId}`,
  ACTIVE_SESSION: (userId) => `active_chat_session_${userId}`,
  HISTORY: (userId, sessionId) => `promtHistory_${userId}_${sessionId}`,
};

const LEGACY_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

const createSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const readSessions = (userId) => {
  if (!userId) return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS(userId)) || '[]');
  } catch {
    return [];
  }
};

const writeSessions = (userId, sessions) => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS(userId), JSON.stringify(sessions));
};

const upsertSession = (userId, session) => {
  const sessions = readSessions(userId);
  const index = sessions.findIndex((item) => item.id === session.id);
  const nextSession = { pinned: false, updatedAt: new Date().toISOString(), title: 'New Chat', ...session };

  if (index >= 0) {
    sessions[index] = { ...sessions[index], ...nextSession };
  } else {
    sessions.unshift(nextSession);
  }

  writeSessions(userId, sessions);
  window.dispatchEvent(new CustomEvent('chat:sessions-changed'));
};

const removeSession = (userId, sessionId) => {
  const sessions = readSessions(userId).filter((item) => item.id !== sessionId);
  localStorage.removeItem(STORAGE_KEYS.HISTORY(userId, sessionId));
  writeSessions(userId, sessions);
  window.dispatchEvent(new CustomEvent('chat:sessions-changed'));
};

function Sidebar({ onClose }) {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(LEGACY_KEYS.USER) || 'null');
  const userId = user?._id || user?.id;
  const [, setAuthUser, clearAuthData] = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(() => {
    return userId ? localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION(userId)) : null;
  });
  const historyRef = useRef(null);

  const refreshSessions = () => {
    if (!userId) return;
    const storedSessions = readSessions(userId)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt));
    setSessions(storedSessions);
    setActiveSessionId(localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION(userId)));
  };

  useEffect(() => {
    refreshSessions();

    const handleRefresh = () => refreshSessions();
    window.addEventListener('chat:sessions-changed', handleRefresh);
    window.addEventListener('storage', handleRefresh);

    return () => {
      window.removeEventListener('chat:sessions-changed', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, [userId]);

  // Auto-scroll history to top when sessions load or update
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return sessions;

    return sessions.filter((session) => {
      return (
        session.title?.toLowerCase().includes(query) ||
        session.preview?.toLowerCase().includes(query)
      );
    });
  }, [searchValue, sessions]);

  const setActiveSession = (sessionId) => {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), sessionId);
    setActiveSessionId(sessionId);
    window.dispatchEvent(new CustomEvent('chat:session-selected', { detail: { sessionId } }));
    if (onClose) onClose();
  };

  const handleNewChat = () => {
    if (!userId) return;
    const sessionId = createSessionId();
    const newSession = {
      id: sessionId,
      title: 'New Chat',
      preview: 'Start a new conversation',
      pinned: false,
      updatedAt: new Date().toISOString(),
    };

    upsertSession(userId, newSession);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION(userId), sessionId);
    setActiveSessionId(sessionId);
    window.dispatchEvent(new CustomEvent('chat:session-selected', { detail: { sessionId } }));
    if (onClose) onClose();
  };

  const handleTogglePin = (sessionId) => {
    if (!userId) return;
    const nextSessions = readSessions(userId).map((session) => {
      if (session.id !== sessionId) return session;
      return { ...session, pinned: !session.pinned, updatedAt: new Date().toISOString() };
    });

    writeSessions(userId, nextSessions);
    window.dispatchEvent(new CustomEvent('chat:sessions-changed'));
  };

  const handleDeleteSession = (sessionId) => {
    if (!userId) return;
    const session = sessions.find((item) => item.id === sessionId);
    const confirmed = window.confirm(`Delete "${session?.title || 'this chat'}"? This cannot be undone.`);
    if (!confirmed) return;

    removeSession(userId, sessionId);

    if (activeSessionId === sessionId) {
      const remaining = readSessions(userId);
      const nextSessionId = remaining[0]?.id;
      if (nextSessionId) {
        setActiveSession(nextSessionId);
      } else {
        handleNewChat();
      }
    }
  };

  const handleExportSession = (sessionId) => {
    if (!userId) return;
    const historyKey = STORAGE_KEYS.HISTORY(userId, sessionId);
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const session = sessions.find((item) => item.id === sessionId);
    const markdown = [
      `# ${session?.title || 'Chat Export'}`,
      '',
      ...history.map((message) => `## ${message.role === 'user' ? 'User' : 'Assistant'}\n\n${message.content}`),
    ].join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session?.title?.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'chat'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    try {
      await axios.get(apiUrl("/user/logout"), {
        withCredentials: true,
      });

      // Clear all auth data
      clearAuthData();
      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      // Still clear auth data even if logout API fails
      clearAuthData();
      setAuthUser(null);
      navigate("/login");
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex border-b border-gray-600 p-2 justify-between items-center mb-4">
          <div className="text-2xl font-bold text-gray-200">Synapse AI</div>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-400 md:hidden" />X
          </button>
        </div>

        <div className="space-y-3 px-1 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-xl border border-gray-700 bg-[#17171a] py-2 pl-9 pr-3 text-sm text-gray-200 outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </div>

      {/* History */}
      <div ref={historyRef} className="flex-1 overflow-y-auto scroll-smooth px-1 space-y-2 hide-scrollbar">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group rounded-xl border p-3 transition ${
                  activeSessionId === session.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-[#17171a] hover:border-gray-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveSession(session.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-100">
                        {session.title || 'New Chat'}
                      </span>
                      {session.pinned && <Pin className="h-3.5 w-3.5 text-yellow-400" />}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {session.preview || 'No preview available'}
                    </div>
                  </div>
                </button>

                <div className="mt-3 flex items-center justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(session.id)}
                    className="rounded-md px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {session.pinned ? <PinOff className="inline h-3.5 w-3.5" /> : <Pin className="inline h-3.5 w-3.5" />}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleExportSession(session.id)}
                      className="rounded-md px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Download className="inline h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      className="rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    >
                      <Trash2 className="inline h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mt-20 text-center text-sm text-gray-500">
              No chat history yet
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-1 border-t border-gray-600">
        <div className="flex  items-center gap-2 cursor-pointer my-3">
          <img
            src="https://i.pravatar.cc/32"
            alt="profile"
            className="rounded-full w-8 h-8"
          />
          <span className="text-gray-300 font-bold">
            {user ? user?.firstName : "My Profile"}
          </span>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 duration-300 transition"
          >
            <LogOut className="" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;