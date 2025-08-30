import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../../stores/chatStore';
import dayjs from 'dayjs';

// Mock dayjs to have predictable timestamps
vi.mock('dayjs', () => {
  let mockTime = 1000000000000; // Fixed timestamp
  const mockDayjs = vi.fn(() => ({
    valueOf: vi.fn(() => mockTime), // Return number, not string
  }));
  mockDayjs.valueOf = vi.fn(() => mockTime);
  // Add method to advance time for testing
  mockDayjs.advanceTime = (ms) => { mockTime += ms; };
  mockDayjs.resetTime = () => { mockTime = 1000000000000; };
  return { default: mockDayjs };
});

describe('ChatStore', () => {
  let store;
  
  beforeEach(() => {
    // Reset dayjs mock
    dayjs.resetTime();
    
    // Reset store to initial state
    store = useChatStore.getState();
    
    // Clear all sessions and create fresh initial state
    const initialTime = dayjs().valueOf();
    useChatStore.setState({
      currentSessionId: initialTime.toString(),
      selectedProvider: 'gemini-2.5-flash',
      sessions: [
        {
          id: initialTime.toString(),
          label: 'New session',
          provider: 'gemini-2.5-flash',
          group: 'Today',
          messages: [],
          createdAt: initialTime,
          updatedAt: initialTime,
          loading: false,
          files: [],
          abortController: null
        }
      ]
    });
  });

  describe('Session Management', () => {
    describe('setCurrentSession', () => {
      it('should switch to existing session', () => {
        const { createSession, setCurrentSession } = useChatStore.getState();
        
        // Create a new session
        dayjs.advanceTime(1000);
        createSession('gpt-4');
        const newSessionId = useChatStore.getState().currentSessionId;
        
        // Create another session
        dayjs.advanceTime(1000);
        createSession('claude-3');
        const anotherSessionId = useChatStore.getState().currentSessionId;
        
        // Switch back to the first new session
        setCurrentSession(newSessionId);
        
        const state = useChatStore.getState();
        expect(state.currentSessionId).toBe(newSessionId);
        expect(state.selectedProvider).toBe('gpt-4');
      });

      it('should not change session if session ID does not exist', () => {
        const { setCurrentSession } = useChatStore.getState();
        const initialState = useChatStore.getState();
        
        setCurrentSession('non-existent-id');
        
        const state = useChatStore.getState();
        expect(state.currentSessionId).toBe(initialState.currentSessionId);
        expect(state.selectedProvider).toBe(initialState.selectedProvider);
      });
    });

    describe('setSelectedProvider', () => {
      it('should update provider for current session', () => {
        const { setSelectedProvider } = useChatStore.getState();
        const initialSessionId = useChatStore.getState().currentSessionId;
        
        setSelectedProvider('claude-3');
        
        const state = useChatStore.getState();
        expect(state.selectedProvider).toBe('claude-3');
        
        const currentSession = state.sessions.find(s => s.id === initialSessionId);
        expect(currentSession.provider).toBe('claude-3');
      });

      it('should update session updatedAt timestamp', () => {
        const { setSelectedProvider } = useChatStore.getState();
        const initialSession = useChatStore.getState().sessions[0];
        const initialUpdatedAt = initialSession.updatedAt;
        
        dayjs.advanceTime(5000);
        setSelectedProvider('gpt-4');
        
        const updatedSession = useChatStore.getState().sessions[0];
        expect(updatedSession.updatedAt).toBeGreaterThan(initialUpdatedAt);
      });
    });

    describe('createSession', () => {
      it('should create new session with default provider', () => {
        const { createSession } = useChatStore.getState();
        const initialSessionsCount = useChatStore.getState().sessions.length;
        
        dayjs.advanceTime(1000);
        createSession();
        
        const state = useChatStore.getState();
        expect(state.sessions.length).toBe(initialSessionsCount + 1);
        
        const newSession = state.sessions[0]; // New sessions are added to the beginning
        expect(newSession.provider).toBe('gemini-2.5-flash');
        expect(newSession.label).toBe('New session');
        expect(newSession.messages).toEqual([]);
        expect(newSession.loading).toBe(false);
        expect(newSession.files).toEqual([]);
        expect(newSession.abortController).toBe(null);
        expect(state.currentSessionId).toBe(newSession.id);
      });

      it('should create new session with specified provider', () => {
        const { createSession } = useChatStore.getState();
        
        dayjs.advanceTime(1000);
        createSession('gpt-4');
        
        const state = useChatStore.getState();
        const newSession = state.sessions[0];
        expect(newSession.provider).toBe('gpt-4');
        expect(state.selectedProvider).toBe('gpt-4');
      });

      it('should add new session to beginning of sessions array', () => {
        const { createSession } = useChatStore.getState();
        const firstSessionId = useChatStore.getState().sessions[0].id;
        
        dayjs.advanceTime(1000);
        createSession('claude-3');
        
        const state = useChatStore.getState();
        expect(state.sessions[0].provider).toBe('claude-3');
        expect(state.sessions[1].id).toBe(firstSessionId);
      });
    });

    describe('deleteSession', () => {
      it('should remove session from sessions array', () => {
        const { createSession, deleteSession } = useChatStore.getState();
        
        dayjs.advanceTime(1000);
        createSession('gpt-4');
        const sessionToDelete = useChatStore.getState().currentSessionId;
        
        deleteSession(sessionToDelete);
        
        const state = useChatStore.getState();
        const deletedSession = state.sessions.find(s => s.id === sessionToDelete);
        expect(deletedSession).toBeUndefined();
      });

      it('should switch to first available session when deleting current session', () => {
        const { createSession, deleteSession } = useChatStore.getState();
        const originalSessionId = useChatStore.getState().currentSessionId;
        
        // Create new session (becomes current)
        dayjs.advanceTime(1000);
        createSession('gpt-4');
        const newSessionId = useChatStore.getState().currentSessionId;
        
        // Delete the current session
        deleteSession(newSessionId);
        
        const state = useChatStore.getState();
        expect(state.currentSessionId).toBe(originalSessionId);
        expect(state.selectedProvider).toBe('gemini-2.5-flash');
      });

      it('should handle deleting non-current session', () => {
        const { createSession, deleteSession, setCurrentSession } = useChatStore.getState();
        
        // Create two new sessions
        dayjs.advanceTime(1000);
        createSession('gpt-4');
        const firstNewSession = useChatStore.getState().currentSessionId;
        
        dayjs.advanceTime(1000);
        createSession('claude-3');
        const secondNewSession = useChatStore.getState().currentSessionId;
        
        // Switch back to first new session
        setCurrentSession(firstNewSession);
        
        // Delete the second session (not current)
        deleteSession(secondNewSession);
        
        const state = useChatStore.getState();
        expect(state.currentSessionId).toBe(firstNewSession);
        expect(state.sessions.find(s => s.id === secondNewSession)).toBeUndefined();
      });
    });

    describe('updateSessionLabel', () => {
      it('should update session label', () => {
        const { updateSessionLabel } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        updateSessionLabel(sessionId, 'Updated Session Name');
        
        const state = useChatStore.getState();
        const updatedSession = state.sessions.find(s => s.id === sessionId);
        expect(updatedSession.label).toBe('Updated Session Name');
      });

      it('should update session updatedAt timestamp', () => {
        const { updateSessionLabel } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialUpdatedAt = useChatStore.getState().sessions[0].updatedAt;
        
        dayjs.advanceTime(3000);
        updateSessionLabel(sessionId, 'New Label');
        
        const updatedSession = useChatStore.getState().sessions[0];
        expect(updatedSession.updatedAt).toBeGreaterThan(initialUpdatedAt);
      });

      it('should handle non-existent session ID', () => {
        const { updateSessionLabel } = useChatStore.getState();
        const initialState = useChatStore.getState();
        
        updateSessionLabel('non-existent', 'New Label');
        
        const state = useChatStore.getState();
        expect(state).toEqual(initialState);
      });
    });
  });

  describe('Message Management', () => {
    describe('addMessage', () => {
      it('should add message to session', () => {
        const { addMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const message = { role: 'user', content: 'Hello world' };
        
        addMessage(sessionId, message);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages).toHaveLength(1);
        expect(session.messages[0].message).toEqual(message);
        expect(session.messages[0].status).toBe('done');
      });

      it('should add message with custom status', () => {
        const { addMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const message = { role: 'assistant', content: 'Hello back' };
        
        addMessage(sessionId, message, 'streaming');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].status).toBe('streaming');
      });

      it('should auto-update session label for first user message', () => {
        const { addMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const longMessage = { role: 'user', content: 'This is a very long message that should be truncated' };
        
        addMessage(sessionId, longMessage);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.label).toBe('This is a very long ');
      });

      it('should not update session label if not a new session', () => {
        const { addMessage, updateSessionLabel } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        // Change label from default
        updateSessionLabel(sessionId, 'Custom Label');
        
        const message = { role: 'user', content: 'Hello world' };
        addMessage(sessionId, message);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.label).toBe('Custom Label');
      });

      it('should update session updatedAt timestamp', () => {
        const { addMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialUpdatedAt = useChatStore.getState().sessions[0].updatedAt;
        
        dayjs.advanceTime(2000);
        addMessage(sessionId, { role: 'user', content: 'Test' });
        
        const updatedSession = useChatStore.getState().sessions[0];
        expect(updatedSession.updatedAt).toBeGreaterThan(initialUpdatedAt);
      });
    });

    describe('updateLastMessage', () => {
      it('should update content of last assistant message', () => {
        const { addMessage, updateLastMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'assistant', content: 'Initial response' });
        updateLastMessage(sessionId, 'Updated response');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].message.content).toBe('Updated response');
      });

      it('should not update if last message is not from assistant', () => {
        const { addMessage, updateLastMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'user', content: 'User message' });
        updateLastMessage(sessionId, 'Should not update');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].message.content).toBe('User message');
      });

      it('should handle session with no messages', () => {
        const { updateLastMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialState = useChatStore.getState();
        
        updateLastMessage(sessionId, 'Should not crash');
        
        const state = useChatStore.getState();
        expect(state).toEqual(initialState);
      });
    });

    describe('appendToLastMessage', () => {
      it('should append content to last assistant message', () => {
        const { addMessage, appendToLastMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'assistant', content: 'Initial' });
        appendToLastMessage(sessionId, ' appended');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].message.content).toBe('Initial appended');
      });

      it('should not append if last message is not from assistant', () => {
        const { addMessage, appendToLastMessage } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'user', content: 'User message' });
        appendToLastMessage(sessionId, ' should not append');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].message.content).toBe('User message');
      });
    });

    describe('updateMessageStatus', () => {
      it('should update message status by index', () => {
        const { addMessage, updateMessageStatus } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'user', content: 'Test' }, 'pending');
        updateMessageStatus(sessionId, 0, 'done');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].status).toBe('done');
      });

      it('should handle invalid message index', () => {
        const { updateMessageStatus } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialState = useChatStore.getState();
        
        updateMessageStatus(sessionId, 5, 'done');
        
        const state = useChatStore.getState();
        expect(state).toEqual(initialState);
      });
    });

    describe('updateLastMessageStatus', () => {
      it('should update status of last message', () => {
        const { addMessage, updateLastMessageStatus } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'assistant', content: 'Test' }, 'streaming');
        updateLastMessageStatus(sessionId, 'done');
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.messages[0].status).toBe('done');
      });

      it('should handle session with no messages', () => {
        const { updateLastMessageStatus } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialState = useChatStore.getState();
        
        updateLastMessageStatus(sessionId, 'done');
        
        const state = useChatStore.getState();
        expect(state).toEqual(initialState);
      });
    });
  });

  describe('Session Loading State Management', () => {
    describe('setSessionLoading', () => {
      it('should update session loading state', () => {
        const { setSessionLoading } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        setSessionLoading(sessionId, true);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.loading).toBe(true);
      });

      it('should update session updatedAt timestamp', () => {
        const { setSessionLoading } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialUpdatedAt = useChatStore.getState().sessions[0].updatedAt;
        
        dayjs.advanceTime(1000);
        setSessionLoading(sessionId, true);
        
        const updatedSession = useChatStore.getState().sessions[0];
        expect(updatedSession.updatedAt).toBeGreaterThan(initialUpdatedAt);
      });
    });

    describe('getSessionLoading', () => {
      it('should return session loading state', () => {
        const { setSessionLoading, getSessionLoading } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        setSessionLoading(sessionId, true);
        
        expect(getSessionLoading(sessionId)).toBe(true);
      });

      it('should return false for non-existent session', () => {
        const { getSessionLoading } = useChatStore.getState();
        
        expect(getSessionLoading('non-existent')).toBe(false);
      });
    });
  });

  describe('Session Files Management', () => {
    describe('setSessionFiles', () => {
      it('should update session files', () => {
        const { setSessionFiles } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const files = [
          { name: 'file1.png', data: 'data1' },
          { name: 'file2.jpg', data: 'data2' }
        ];
        
        setSessionFiles(sessionId, files);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.files).toEqual(files);
      });

      it('should update session updatedAt timestamp', () => {
        const { setSessionFiles } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialUpdatedAt = useChatStore.getState().sessions[0].updatedAt;
        
        dayjs.advanceTime(1000);
        setSessionFiles(sessionId, [{ name: 'test.png' }]);
        
        const updatedSession = useChatStore.getState().sessions[0];
        expect(updatedSession.updatedAt).toBeGreaterThan(initialUpdatedAt);
      });
    });

    describe('getSessionFiles', () => {
      it('should return session files', () => {
        const { setSessionFiles, getSessionFiles } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const files = [{ name: 'test.png', data: 'test-data' }];
        
        setSessionFiles(sessionId, files);
        
        expect(getSessionFiles(sessionId)).toEqual(files);
      });

      it('should return empty array for non-existent session', () => {
        const { getSessionFiles } = useChatStore.getState();
        
        expect(getSessionFiles('non-existent')).toEqual([]);
      });
    });

    describe('clearSessionFiles', () => {
      it('should clear session files', () => {
        const { setSessionFiles, clearSessionFiles } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        setSessionFiles(sessionId, [{ name: 'test.png' }]);
        clearSessionFiles(sessionId);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.files).toEqual([]);
      });
    });
  });

  describe('AbortController Management', () => {
    describe('setSessionAbortController', () => {
      it('should set abort controller for session', () => {
        const { setSessionAbortController } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const controller = new AbortController();
        
        setSessionAbortController(sessionId, controller);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        expect(session.abortController).toBe(controller);
      });
    });

    describe('getSessionAbortController', () => {
      it('should return session abort controller', () => {
        const { setSessionAbortController, getSessionAbortController } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const controller = new AbortController();
        
        setSessionAbortController(sessionId, controller);
        
        expect(getSessionAbortController(sessionId)).toBe(controller);
      });

      it('should return null for non-existent session', () => {
        const { getSessionAbortController } = useChatStore.getState();
        
        expect(getSessionAbortController('non-existent')).toBe(null);
      });
    });

    describe('abortSessionRequest', () => {
      it('should abort request and clear controller', () => {
        const { setSessionAbortController, setSessionLoading, abortSessionRequest } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const controller = new AbortController();
        const abortSpy = vi.spyOn(controller, 'abort');
        
        setSessionAbortController(sessionId, controller);
        setSessionLoading(sessionId, true);
        
        abortSessionRequest(sessionId);
        
        const state = useChatStore.getState();
        const session = state.sessions.find(s => s.id === sessionId);
        
        expect(abortSpy).toHaveBeenCalled();
        expect(session.abortController).toBe(null);
        expect(session.loading).toBe(false);
      });

      it('should handle session without abort controller', () => {
        const { abortSessionRequest } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        const initialState = useChatStore.getState();
        
        abortSessionRequest(sessionId);
        
        const state = useChatStore.getState();
        // State should remain unchanged except for updatedAt
        expect(state.sessions[0].abortController).toBe(initialState.sessions[0].abortController);
        expect(state.sessions[0].loading).toBe(initialState.sessions[0].loading);
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('clearAllSessions', () => {
      it('should clear all sessions and create new one', () => {
        const { createSession, clearAllSessions } = useChatStore.getState();
        
        // Create multiple sessions
        createSession('gpt-4');
        createSession('claude-3');
        
        expect(useChatStore.getState().sessions.length).toBeGreaterThan(1);
        
        dayjs.advanceTime(5000);
        clearAllSessions();
        
        const state = useChatStore.getState();
        expect(state.sessions).toHaveLength(1);
        expect(state.sessions[0].label).toBe('New session');
        expect(state.sessions[0].provider).toBe('gemini-2.5-flash');
        expect(state.sessions[0].messages).toEqual([]);
        expect(state.selectedProvider).toBe('gemini-2.5-flash');
      });
    });
  });

  describe('Selectors (Computed Values)', () => {
    describe('getCurrentSession', () => {
      it('should return current session', () => {
        const { getCurrentSession } = useChatStore.getState();
        const currentSessionId = useChatStore.getState().currentSessionId;
        
        const currentSession = getCurrentSession();
        
        expect(currentSession.id).toBe(currentSessionId);
      });

      it('should return undefined if current session not found', () => {
        const { getCurrentSession } = useChatStore.getState();
        
        // Manually set invalid current session ID
        useChatStore.setState({ currentSessionId: 'invalid-id' });
        
        const currentSession = getCurrentSession();
        expect(currentSession).toBeUndefined();
      });
    });

    describe('getCurrentMessages', () => {
      it('should return messages from current session', () => {
        const { addMessage, getCurrentMessages } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        addMessage(sessionId, { role: 'user', content: 'Test 1' });
        addMessage(sessionId, { role: 'assistant', content: 'Test 2' });
        
        const messages = getCurrentMessages();
        
        expect(messages).toHaveLength(2);
        expect(messages[0].message.content).toBe('Test 1');
        expect(messages[1].message.content).toBe('Test 2');
      });

      it('should return empty array if current session not found', () => {
        const { getCurrentMessages } = useChatStore.getState();
        
        useChatStore.setState({ currentSessionId: 'invalid-id' });
        
        const messages = getCurrentMessages();
        expect(messages).toEqual([]);
      });
    });

    describe('getSessionById', () => {
      it('should return session by ID', () => {
        const { getSessionById } = useChatStore.getState();
        const sessionId = useChatStore.getState().currentSessionId;
        
        const session = getSessionById(sessionId);
        
        expect(session.id).toBe(sessionId);
      });

      it('should return undefined for non-existent session', () => {
        const { getSessionById } = useChatStore.getState();
        
        const session = getSessionById('non-existent');
        expect(session).toBeUndefined();
      });
    });

    describe('getSessionList', () => {
      it('should return formatted session list', () => {
        const { createSession, addMessage, getSessionList } = useChatStore.getState();
        
        // Add message to current session
        const currentSessionId = useChatStore.getState().currentSessionId;
        addMessage(currentSessionId, { role: 'user', content: 'Hello' });
        
        // Create another session
        dayjs.advanceTime(1000);
        createSession('gpt-4');
        
        const sessionList = getSessionList();
        
        expect(sessionList).toHaveLength(2);
        expect(sessionList[0].key).toBeDefined();
        expect(sessionList[0].label).toBeDefined();
        expect(sessionList[0].provider).toBeDefined();
        expect(sessionList[0].group).toBeDefined();
        expect(sessionList[0].messages).toBeDefined();
        expect(sessionList[0].createdAt).toBeDefined();
        expect(sessionList[0].updatedAt).toBeDefined();
        expect(sessionList[0].loading).toBeDefined();
        expect(sessionList[0].files).toBeDefined();
      });
    });

    describe('getTotalSessions', () => {
      it('should return total number of sessions', () => {
        const { createSession, getTotalSessions } = useChatStore.getState();
        
        expect(getTotalSessions()).toBe(1);
        
        createSession('gpt-4');
        expect(getTotalSessions()).toBe(2);
        
        createSession('claude-3');
        expect(getTotalSessions()).toBe(3);
      });
    });

    describe('getTotalMessages', () => {
      it('should return total number of messages across all sessions', () => {
        const { createSession, addMessage, getTotalMessages } = useChatStore.getState();
        const firstSessionId = useChatStore.getState().currentSessionId;
        
        // Add messages to first session
        addMessage(firstSessionId, { role: 'user', content: 'Hello 1' });
        addMessage(firstSessionId, { role: 'assistant', content: 'Hi 1' });
        
        // Create second session and add messages
        createSession('gpt-4');
        const secondSessionId = useChatStore.getState().currentSessionId;
        addMessage(secondSessionId, { role: 'user', content: 'Hello 2' });
        
        expect(getTotalMessages()).toBe(3);
      });

      it('should return 0 when no messages exist', () => {
        const { getTotalMessages } = useChatStore.getState();
        
        expect(getTotalMessages()).toBe(0);
      });
    });
  });

  describe('Complex State Interactions', () => {
    it('should handle session switching with different providers', () => {
      const { createSession, setCurrentSession, addMessage } = useChatStore.getState();
      
      // Create sessions with different providers
      dayjs.advanceTime(1000);
      createSession('gpt-4');
      const gptSessionId = useChatStore.getState().currentSessionId;
      addMessage(gptSessionId, { role: 'user', content: 'GPT message' });
      
      dayjs.advanceTime(1000);
      createSession('claude-3');
      const claudeSessionId = useChatStore.getState().currentSessionId;
      addMessage(claudeSessionId, { role: 'user', content: 'Claude message' });
      
      // Switch back to GPT session
      setCurrentSession(gptSessionId);
      
      const state = useChatStore.getState();
      expect(state.currentSessionId).toBe(gptSessionId);
      // Find the GPT session to verify its provider
      const gptSession = state.sessions.find(s => s.id === gptSessionId);
      expect(state.selectedProvider).toBe(gptSession.provider);
      expect(gptSession.provider).toBe('gpt-4');
      
      const currentSession = state.sessions.find(s => s.id === gptSessionId);
      expect(currentSession.messages[0].message.content).toBe('GPT message');
    });

    it('should maintain session state consistency during concurrent operations', () => {
      const { 
        createSession, 
        addMessage, 
        setSessionLoading, 
        setSessionFiles,
        updateSessionLabel 
      } = useChatStore.getState();
      
      // Create session and perform multiple operations
      createSession('gpt-4');
      const sessionId = useChatStore.getState().currentSessionId;
      
      // Simulate concurrent operations
      addMessage(sessionId, { role: 'user', content: 'Test message' });
      setSessionLoading(sessionId, true);
      setSessionFiles(sessionId, [{ name: 'test.png' }]);
      updateSessionLabel(sessionId, 'Test Session');
      
      const session = useChatStore.getState().sessions.find(s => s.id === sessionId);
      
      expect(session.messages).toHaveLength(1);
      expect(session.loading).toBe(true);
      expect(session.files).toHaveLength(1);
      expect(session.label).toBe('Test Session');
      expect(session.provider).toBe('gpt-4');
    });

    it('should handle edge case of deleting all sessions except one', () => {
      const { createSession, deleteSession } = useChatStore.getState();
      
      // Create multiple sessions
      const originalSessionId = useChatStore.getState().currentSessionId;
      dayjs.advanceTime(1000);
      createSession('gpt-4');
      const gptSessionId = useChatStore.getState().currentSessionId;
      dayjs.advanceTime(1000);
      createSession('claude-3');
      const claudeSessionId = useChatStore.getState().currentSessionId;
      
      // Delete sessions one by one (delete current session first)
      deleteSession(claudeSessionId); // This should switch to gptSession
      deleteSession(gptSessionId);    // This should switch to originalSession
      
      const state = useChatStore.getState();
      expect(state.sessions).toHaveLength(1);
      expect(state.currentSessionId).toBe(originalSessionId);
      expect(state.selectedProvider).toBe('gemini-2.5-flash');
    });
  });
});
