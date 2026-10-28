import React, { useState, useRef, useEffect } from 'react';
import './CyberAIChatbot.scss';

export interface CyberAIChatbotProps {
  projectName?: string;
  projectDescription?: string;
  quickPrompts?: string[];
  bankId?: string;
  apiKey?: string;
  apiUrl?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const DEFAULT_API_URL = 'https://api.hindsight.vectorize.io';
const DEFAULT_API_KEY = 'hsk_50b425c99734390d6a9f74d59a7f5e78_021b3c05d1268660';
const DEFAULT_BANK_ID = 'cybersecurity-copilot';

export const CyberAIChatbot: React.FC<CyberAIChatbotProps> = ({
  projectName = 'Honeypot Network',
  projectDescription = 'Multi-service deception network (SSH, HTTP, Redis) collecting telemetry, attacker payloads, and MITRE ATT&CK mapping.',
  quickPrompts = [
    'Analyze attacker session logs',
    'Map recent activity to MITRE ATT&CK',
    'Extract suspicious IOCs from payload',
    'Recommend firewall blocking rule',
  ],
  bankId = DEFAULT_BANK_ID,
  apiKey = DEFAULT_API_KEY,
  apiUrl = DEFAULT_API_URL,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: `👋 Greetings! I am your **Honeypot & Threat Attribution Copilot** powered by **Hindsight AI**. I can assist with IOC extraction, MITRE ATT&CK mapping, and threat actor behavior analysis for **${projectName}**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = `${apiUrl}/v1/default/banks/${bankId}/reflect`;
      const queryWithContext = `[Context: Project is ${projectName}. Description: ${projectDescription}]\n\nUser Question: ${trimmed}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query: queryWithContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const botReply = data.text || 'No response returned from reasoning model.';

      const assistantMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Agent Communication Error**: ${err.message || 'Unable to connect to Hindsight AI.'}\n\nPlease check your network connection or verify that the API endpoint is reachable.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (raw: string, msgId: string) => {
    const parts = raw.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
        const blockId = `${msgId}-code-${idx}`;

        return (
          <div key={idx} className="cyber-code-block">
            <div className="cyber-code-header">
              <span>{lang || 'code'}</span>
              <button
                type="button"
                className="cyber-copy-btn"
                onClick={() => copyToClipboard(code, blockId)}
              >
                {copiedId === blockId ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <span key={idx}>
          {lines.map((line, lineIdx) => {
            const formattedLine = line
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

            if (line.startsWith('* ') || line.startsWith('- ')) {
              return (
                <div
                  key={lineIdx}
                  className="cyber-bullet"
                  dangerouslySetInnerHTML={{ __html: '• ' + formattedLine.slice(2) }}
                />
              );
            }
            return (
              <React.Fragment key={lineIdx}>
                <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className="cyber-ai-widget-root">
      <button
        type="button"
        className={`cyber-ai-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open Honeypot Threat Intel Copilot"
        aria-label="Open Honeypot Threat Intel Copilot"
      >
        <span className="cyber-ai-trigger-icon">🛡️</span>
        <span className="cyber-ai-trigger-pulse" />
        <span className="cyber-ai-trigger-label">Threat Copilot</span>
      </button>

      {isOpen && (
        <div className="cyber-ai-modal" role="dialog" aria-modal="true">
          <div className="cyber-ai-header">
            <div className="cyber-ai-header-left">
              <span className="cyber-ai-status-indicator" />
              <div>
                <h4 className="cyber-ai-title">🛡️ Threat Intel Copilot</h4>
                <p className="cyber-ai-subtitle">Powered by Hindsight Vectorize • {projectName}</p>
              </div>
            </div>
            <div className="cyber-ai-header-actions">
              <button
                type="button"
                className="cyber-ai-icon-btn"
                onClick={() =>
                  setMessages([
                    {
                      id: 'reset-1',
                      role: 'assistant',
                      text: `Conversation reset. Ready for your next investigation on **${projectName}**.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Clear Chat"
              >
                🔄
              </button>
              <button
                type="button"
                className="cyber-ai-icon-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Window"
              >
                ✕
              </button>
            </div>
          </div>

          {quickPrompts && quickPrompts.length > 0 && (
            <div className="cyber-ai-chips-bar">
              <span className="cyber-ai-chips-label">Quick Prompts:</span>
              <div className="cyber-ai-chips-scroll">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="cyber-ai-chip"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="cyber-ai-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`cyber-ai-message-wrapper ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}`}
              >
                <div className="cyber-ai-avatar">
                  {msg.role === 'user' ? '👤' : '🛡️'}
                </div>
                <div className="cyber-ai-bubble">
                  <div className="cyber-ai-bubble-content">
                    {renderFormattedText(msg.text, msg.id)}
                  </div>
                  <span className="cyber-ai-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="cyber-ai-message-wrapper bot-msg">
                <div className="cyber-ai-avatar">🛡️</div>
                <div className="cyber-ai-bubble loading-bubble">
                  <span className="cyber-dot" />
                  <span className="cyber-dot" />
                  <span className="cyber-dot" />
                  <span className="cyber-loading-text">Analyzing Honeypot Telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="cyber-ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="cyber-ai-input"
              placeholder={`Ask about attacker payloads or MITRE techniques in ${projectName}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="cyber-ai-send-btn"
              disabled={!input.trim() || isLoading}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CyberAIChatbot;
