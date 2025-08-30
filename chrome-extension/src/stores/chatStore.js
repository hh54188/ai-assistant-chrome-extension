import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';

const DEFAULT_PROVIDER = 'gemini-2.5-flash';

/**
 * Chat Store - Manages persistent chat data across sessions
 * 
 * This store contains:
 * - All chat sessions and their messages
 * - Current session tracking
 * - AI provider settings
 * - Session-specific files and loading states
 * - Persistent user preferences
 */
export const useChatStore = create(
        immer((set, get) => ({
            // ==================== Session Management ====================
            currentSessionId: dayjs().valueOf().toString(),
            selectedProvider: DEFAULT_PROVIDER,
            
            // ==================== Session Data ====================
            sessions: [
                {
                    id: dayjs().valueOf().toString(),
                    label: 'New session',
                    provider: DEFAULT_PROVIDER,
                    group: 'Today',
                    messages: [],
                    createdAt: dayjs().valueOf(),
                    updatedAt: dayjs().valueOf(),
                    // Per-session state (co-located for better data locality)
                    loading: false,
                    files: [],
                    abortController: null // Note: AbortControllers can't be persisted, will be recreated
                }
            ],
            
            // ==================== Actions ====================
            
            // Session management
            setCurrentSession: (sessionId) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    state.currentSessionId = sessionId;
                    state.selectedProvider = session.provider;
                }
            }),
            
            setSelectedProvider: (provider) => set((state) => {
                state.selectedProvider = provider;
                // Update current session's provider
                const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
                if (currentSession) {
                    currentSession.provider = provider;
                    currentSession.updatedAt = dayjs().valueOf();
                }
            }),
            
            // Session CRUD operations
            createSession: (provider = DEFAULT_PROVIDER) => set((state) => {
                const newSessionId = dayjs().valueOf().toString();
                const newSession = {
                    id: newSessionId,
                    label: 'New session',
                    provider,
                    group: 'Today',
                    messages: [],
                    createdAt: dayjs().valueOf(),
                    updatedAt: dayjs().valueOf(),
                    // Initialize per-session state
                    loading: false,
                    files: [],
                    abortController: null
                };
                
                // Add to beginning of sessions array
                state.sessions.unshift(newSession);
                state.currentSessionId = newSessionId;
                state.selectedProvider = provider;
            }),
            
            // Create session without switching to it (for turbo mode)
            addSession: (sessionId, provider = DEFAULT_PROVIDER) => set((state) => {
                const newSession = {
                    id: sessionId,
                    label: 'New session',
                    provider,
                    group: 'Today',
                    messages: [],
                    createdAt: dayjs().valueOf(),
                    updatedAt: dayjs().valueOf(),
                    // Initialize per-session state
                    loading: false,
                    files: [],
                    abortController: null
                };
                
                // Add to beginning of sessions array without changing current session
                state.sessions.unshift(newSession);
            }),
            
            deleteSession: (sessionId) => set((state) => {
                state.sessions = state.sessions.filter(s => s.id !== sessionId);
                
                // If deleting current session, switch to first available
                if (state.currentSessionId === sessionId && state.sessions.length > 0) {
                    state.currentSessionId = state.sessions[0].id;
                    state.selectedProvider = state.sessions[0].provider;
                }
            }),
            
            updateSessionLabel: (sessionId, label) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.label = label;
                    session.updatedAt = dayjs().valueOf();
                }
            }),
            
            // Message management
            addMessage: (sessionId, message, status = 'done') => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.messages.push({ message, status });
                    session.updatedAt = dayjs().valueOf();
                    
                    // Auto-update session label if it's a new session with first user message
                    if (session.label === 'New session' && message.role === 'user') {
                        session.label = message.content.slice(0, 20);
                    }
                }
            }),
            
            updateLastMessage: (sessionId, content) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session && session.messages.length > 0) {
                    const lastMessage = session.messages[session.messages.length - 1];
                    if (lastMessage.message.role === 'assistant') {
                        lastMessage.message.content = content;
                        session.updatedAt = dayjs().valueOf();
                    }
                }
            }),
            
            appendToLastMessage: (sessionId, content) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session && session.messages.length > 0) {
                    const lastMessage = session.messages[session.messages.length - 1];
                    if (lastMessage.message.role === 'assistant') {
                        lastMessage.message.content += content;
                        session.updatedAt = dayjs().valueOf();
                    }
                }
            }),
            
            updateMessageStatus: (sessionId, messageIndex, status) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session && session.messages[messageIndex]) {
                    session.messages[messageIndex].status = status;
                    session.updatedAt = dayjs().valueOf();
                }
            }),
            
            updateLastMessageStatus: (sessionId, status) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session && session.messages.length > 0) {
                    session.messages[session.messages.length - 1].status = status;
                    session.updatedAt = dayjs().valueOf();
                }
            }),
            
                        // Session loading state management
            setSessionLoading: (sessionId, loading) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.loading = loading;
                    session.updatedAt = dayjs().valueOf();
                }
            }),

            getSessionLoading: (sessionId) => {
                const state = get();
                const session = state.sessions.find(s => s.id === sessionId);
                return session ? session.loading : false;
            },

            // Session files management
            setSessionFiles: (sessionId, files) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.files = files;
                    session.updatedAt = dayjs().valueOf();
                }
            }),

            getSessionFiles: (sessionId) => {
                const state = get();
                const session = state.sessions.find(s => s.id === sessionId);
                return session ? session.files : [];
            },

            clearSessionFiles: (sessionId) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.files = [];
                    session.updatedAt = dayjs().valueOf();
                }
            }),

            // AbortController management (runtime only, not persisted)
            setSessionAbortController: (sessionId, controller) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.abortController = controller;
                }
            }),

            getSessionAbortController: (sessionId) => {
                const state = get();
                const session = state.sessions.find(s => s.id === sessionId);
                return session ? session.abortController : null;
            },

            abortSessionRequest: (sessionId) => set((state) => {
                const session = state.sessions.find(s => s.id === sessionId);
                if (session && session.abortController) {
                    session.abortController.abort();
                    session.abortController = null;
                    session.loading = false;
                    session.updatedAt = dayjs().valueOf();
                }
            }),
            
            // Bulk operations
            clearAllSessions: () => set((state) => {
                // Keep one new session
                const newSessionId = dayjs().valueOf().toString();
                state.sessions = [{
                    id: newSessionId,
                    label: 'New session',
                    provider: DEFAULT_PROVIDER,
                    group: 'Today',
                    messages: [],
                    createdAt: dayjs().valueOf(),
                    updatedAt: dayjs().valueOf(),
                    loading: false,
                    files: [],
                    abortController: null
                }];
                state.currentSessionId = newSessionId;
                state.selectedProvider = DEFAULT_PROVIDER;
            }),
            
            // Selectors (computed values)
            getCurrentSession: () => {
                const state = get();
                return state.sessions.find(s => s.id === state.currentSessionId);
            },
            
            getCurrentMessages: () => {
                const state = get();
                const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
                return currentSession ? currentSession.messages : [];
            },
            
            getSessionById: (sessionId) => {
                const state = get();
                return state.sessions.find(s => s.id === sessionId);
            },
            
            getSessionList: () => {
                const state = get();
                return state.sessions.map(session => ({
                    key: session.id,
                    label: session.label,
                    provider: session.provider,
                    group: session.group,
                    messages: session.messages,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    loading: session.loading,
                    files: session.files
                }));
            },
            
            // Statistics and metadata
            getTotalSessions: () => {
                const state = get();
                return state.sessions.length;
            },
            
            getTotalMessages: () => {
                const state = get();
                return state.sessions.reduce((total, session) => total + session.messages.length, 0);
            }
        })),
        {
            name: 'chat-store', // Storage key
            // Only persist certain parts of the state
            partialize: (state) => ({
                currentSessionId: state.currentSessionId,
                selectedProvider: state.selectedProvider,
                sessions: state.sessions.map(session => ({
                    ...session,
                    // Don't persist abortController as it can't be serialized
                    abortController: null,
                    // Reset loading state on page load
                    loading: false
                }))
            }),
        }
);
