import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { chatbotService } from '../services/api';

// Simple markdown renderer for code blocks and formatting
const renderMarkdown = (text) => {
  if (!text) return null;
  
  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Code block
      const lines = part.slice(3, -3).split('\n');
      const language = lines[0].trim();
      const code = lines.slice(1).join('\n');
      
      return (
        <pre key={index} className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-sm">
          {language && (
            <div className="text-xs text-gray-400 mb-2 uppercase">{language}</div>
          )}
          <code>{code || lines.join('\n')}</code>
        </pre>
      );
    }
    
    // Process inline formatting
    return (
      <span key={index}>
        {part.split('\n').map((line, i) => {
          // Process inline code
          const processedLine = line.split(/(`[^`]+`)/g).map((segment, j) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return (
                <code key={j} className="bg-gray-200 px-1.5 py-0.5 rounded text-sm text-primary-700">
                  {segment.slice(1, -1)}
                </code>
              );
            }
            // Process bold
            return segment.split(/(\*\*[^*]+\*\*)/g).map((seg, k) => {
              if (seg.startsWith('**') && seg.endsWith('**')) {
                return <strong key={k}>{seg.slice(2, -2)}</strong>;
              }
              return seg;
            });
          });
          
          return (
            <span key={i}>
              {processedLine}
              {i < line.length - 1 && <br />}
            </span>
          );
        })}
      </span>
    );
  });
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI technical assistant. Ask me anything about programming, algorithms, system design, or interview preparation!"
    }
  ]);
  const [input, setInput] = useState('');
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
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Prepare history for API (exclude the welcome message and current user message)
      const history = newMessages.slice(1, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await chatbotService.sendMessage(userMessage, history);
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error processing your request. Please try again." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI technical assistant. Ask me anything about programming, algorithms, system design, or interview preparation!"
      }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[600px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Tech Assistant</span>
          {isLoading && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">typing...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                'Explain Big O notation',
                'React hooks example',
                'SQL vs NoSQL',
                'System design tips'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a technical question..."
                rows={1}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <button
                type="button"
                onClick={clearChat}
                className="text-gray-400 hover:text-gray-600"
              >
                Clear chat
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
