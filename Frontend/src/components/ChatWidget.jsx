import React, { useEffect, useRef, useState } from "react";
import "../styles/ChatWidget.css";
import { useAuth } from "../context/AuthContext";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Import the image (make sure to place your image in the correct folder)
import vetIcon from "../assets/vet-girl.png"; // Update this path to your actual image

const BOT_WELCOME = "Hi! I'm PawBot. Ask me about pet vaccination, nutrition, or general pet health advice!";
const OFFLINE_REPLY = "Thanks for your message. I can help with appointments, pet care tips, or direct you to clinic contacts. (offline)";

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const getStorageKey = () => user ? `petcare_chat_messages_${user._id || user.id}` : "petcare_chat_messages_guest";

  const [messages, setMessages] = useState(() => {
    try {
      const key = user ? `petcare_chat_messages_${user._id || user.id}` : "petcare_chat_messages_guest";
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Reset cache if the first message is stale (welcome text changed)
        if (parsed[0]?.text !== BOT_WELCOME) {
          localStorage.removeItem(key);
          return [{ id: 1, from: "bot", text: BOT_WELCOME }];
        }
        return parsed;
      }
      return [{ id: 1, from: "bot", text: BOT_WELCOME }];
    } catch (error) {
      return [{ id: 1, from: "bot", text: BOT_WELCOME }];
    }
  });

  // Handle user switching: reload messages for the new user
  useEffect(() => {
    if (user) {
      const key = `petcare_chat_messages_${user._id || user.id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // Reset cache if the first message is stale
          if (parsed[0]?.text !== BOT_WELCOME) {
            localStorage.removeItem(key);
            setMessages([{ id: Date.now(), from: "bot", text: BOT_WELCOME }]);
          } else {
            setMessages(parsed);
          }
        } catch {
          setMessages([{ id: Date.now(), from: "bot", text: BOT_WELCOME }]);
        }
      } else {
        setMessages([{ id: Date.now(), from: "bot", text: BOT_WELCOME }]);
      }
    }
  }, [user?.id, user?._id]);

  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const typingId = `typing-${Date.now()}`;
    const typingMsg = { id: typingId, from: "bot", text: "...", typing: true };
    setMessages((m) => [...m, typingMsg]);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', text);

      const res = await fetch('http://127.0.0.1:5000/ask', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      const data = await res.json();
      const replyText = data?.response ?? OFFLINE_REPLY;

      setMessages((m) => m.map((msg) => (msg.id === typingId ? { id: Date.now() + 1, from: 'bot', text: replyText } : msg)));
    } catch (err) {
      console.error('Chat API error', err);
      setMessages((m) => m.map((msg) => (msg.id === typingId ? { id: Date.now() + 1, from: 'bot', text: OFFLINE_REPLY } : msg)));
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    const initial = [{ id: Date.now(), from: "bot", text: BOT_WELCOME }];
    setMessages(initial);
    localStorage.setItem(getStorageKey(), JSON.stringify(initial));
  };

  if (!user) return null;

  return (
    <div>
      <div className={`chat-widget ${open ? "open" : ""}`} aria-live="polite">
        {open ? (
          <div className="chat-panel" role="dialog" aria-label="PetCare chat">
            <div className="chat-header">
              <div className="chat-title">
                <div className="bot-avatar">
                  <img
                    src={vetIcon}
                    alt="PawBot"
                    className="vet-icon"
                  />
                </div>
                <div>
                  <div className="title">PawBot</div>
                  <div className="status">AI Pet Assistant</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="reset-btn"
                  onClick={handleResetChat}
                  aria-label="Reset chat"
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
                  title="Clear Chat"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
                <button
                  className="close-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Minimize chat"
                >
                  —
                </button>
              </div>
            </div>

            <div className="chat-body" ref={listRef}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${m.from === "bot" ? "bot" : "user"} ${m.typing ? 'typing' : ''}`}
                >
                  <div className="bubble-text">
                    {m.typing ? (
                      <div className="typing-dots" aria-hidden>
                        <span></span><span></span><span></span>
                      </div>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(input); } }}
                placeholder="Type your message here..."
                aria-label="Type message"
                disabled={loading}
                aria-busy={loading}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage(input)}
                aria-label="Send message"
                disabled={loading}
                title={loading ? 'Waiting for reply...' : 'Send'}
              >
                {loading ? '…' : '➤'}
              </button>
            </div>
            <div className="chat-footer">Ask about vaccinations, nutrition, or pet health tips 🐾</div>
          </div>
        ) : (
          <button
            className="chat-launch floating"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            title="Chat with PawBot"
          >
            <div className="launch-icon">
              <img
                src={vetIcon}
                alt="Chat with PawBot"
                className="vet-icon-launch"
              />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;