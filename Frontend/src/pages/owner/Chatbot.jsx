// PetChatbotPage.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function PetChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      sender: 'bot',
      text: `Hello Dinesh! 🐶🐱\n\nI'm your friendly pet health advisor focused on dogs and cats in Sri Lanka.\nYou can ask me about:\n• Vaccination schedules\n• Nutrition & safe foods\n• Common symptoms & prevention\n• Basic first aid\n\nImportant: This is general information only — always consult a real veterinarian for diagnosis or treatment!`,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/pet-chatbot', {
        message: trimmed,
      });

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.response || 'No response received.',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        :root {
          --pet-teal:    #2dd4bf;
          --pet-green:   #4ade80;
          --pet-bg:      #f0fdfa;
          --pet-light:   #ecfdf5;
          --pet-dark:    #0f766e;
          --text-dark:   #1f2937;
          --text-light:  #4b5563;
        }

        .chat-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(to bottom, var(--pet-bg), #ffffff);
          font-family: system-ui, -apple-system, sans-serif;
        }

        .header {
          background: linear-gradient(135deg, var(--pet-teal), var(--pet-green));
          color: white;
          padding: 1rem 1.5rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .header p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .message {
          max-width: 80%;
          display: flex;
          flex-direction: column;
        }

        .message.user {
          align-self: flex-end;
        }

        .message.bot {
          align-self: flex-start;
        }

        .bubble {
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          line-height: 1.5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .bubble.user {
          background: var(--pet-green);
          color: white;
          border-bottom-right-radius: 0.5rem;
        }

        .bubble.bot {
          background: white;
          color: var(--text-dark);
          border-bottom-left-radius: 0.5rem;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--pet-teal);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-right: 0.75rem;
        }

        .input-area {
          padding: 1rem 1.5rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .input-field {
          flex: 1;
          padding: 0.9rem 1.25rem;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }

        .input-field:focus {
          border-color: var(--pet-teal);
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
        }

        .send-button {
          background: var(--pet-teal);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 0.9rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
        }

        .send-button:hover:not(:disabled) {
          background: #0d9488;
          transform: translateY(-1px);
        }

        .send-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.8rem 1.2rem;
          background: white;
          border-radius: 1.25rem;
          border-bottom-left-radius: 0.5rem;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .disclaimer {
          text-align: center;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.75rem;
          padding: 0 1rem;
        }
      `}</style>

      <div className="chat-container">
        <header className="header">
          <h1>PetCare Advisor</h1>
          <p>Dogs & Cats • Sri Lanka • Preventive Care</p>
        </header>

        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {msg.sender === 'bot' && <div className="avatar">PA</div>}
                <div className={`bubble ${msg.sender}`}>{msg.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="avatar">PA</div>
                <div className="typing-indicator">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              className="input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about vaccinations, food, symptoms..."
              disabled={isLoading}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
            >
              Send
            </button>
          </div>
          <div className="disclaimer">
            This is general guidance only • Not a veterinary diagnosis • Consult a vet for emergencies
          </div>
        </div>
      </div>
    </>
  );
}

export default PetChatbotPage;