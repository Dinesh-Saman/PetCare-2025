import React, { useEffect, useRef, useState } from "react";
import "../styles/ChatWidget.css";

const BOT_WELCOME = "Hi! I'm PetCareBot. Ask me about pet care, appointments, or clinic info.";
const OFFLINE_REPLY = "Thanks for your message. I can help with appointments, pet care tips, or direct you to clinic contacts. (offline)";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem("petcare_chat_messages");
      return raw ? JSON.parse(raw) : [{ id: 1, from: "bot", text: BOT_WELCOME }];
    } catch () {
      return [{ id: 1, from: "bot", text: BOT_WELCOME }];
    }
  });

  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("petcare_chat_messages", JSON.stringify(messages));
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

  return (
    <div>
      {/* Floating chat button */}
      <div className={`chat-widget ${open ? "open" : ""}`} aria-live="polite">
        {open ? (
          <div className="chat-panel" role="dialog" aria-label="PetCare chat">
            <div className="chat-header">
              <div className="chat-title">
                <div className="bot-avatar">🤖</div>
                <div>
                  <div className="title">PetCare Bot</div>
                  <div className="status">Online</div>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
              >
                —
              </button>
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
            <div className="chat-footer">Type a question or ask for pet care tips ✅</div>
          </div>
        ) : (
          <button
            className="chat-launch"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            title="Chat with PetCare Bot"
          >
            <div className="launch-icon">🤖</div>
          </button>
        )}
      </div>

      {/* small mobile spacer to prevent covering bottom navs */}
      <div style={{ height: 12 }} />
    </div>
  );
};

export default ChatWidget;
