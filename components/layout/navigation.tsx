'use client';

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { aiModel, scribbleTextEffect } from '../ai/ai-model';
import {
  HomeIcon,
  AboutIcon,
  WorkIcon,
  StudiesIcon,
  ContactIcon,
  ChatIcon,
  ClearIcon,
} from '../ui/hand-drawn-icons';

// Chat message type
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Navigation = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentAiResponse, setCurrentAiResponse] = useState<string>('');
  const [aiThinking, setAiThinking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, currentAiResponse]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);// Handle AI search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    const query = search.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    
    // Add user message to chat
    setChatMessages(prev => [...prev, userMessage]);
    setSearch(''); // Clear input immediately
    setCurrentAiResponse('');
    setAiThinking(true);
    setChatOpen(true);
    setIsTyping(false);
    setShowQuickActions(false);
    
    // Get instant AI response with scribble effect (faster speed: 12ms per char)
    const answer = aiModel(query);
    scribbleTextEffect(answer, 
      (displayed) => setCurrentAiResponse(displayed), 
      () => {
        // When scribble is complete, add final AI message to chat
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: answer,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setCurrentAiResponse('');
        setAiThinking(false);
      }, 
      12
    );
  };
  // Handle typing indicator with debouncing and smart suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Show typing indicator
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
    }
    
    // Generate contextual suggestions based on input
    if (value.length > 2) {
      const suggestions = generateContextualSuggestions(value);
      setContextualSuggestions(suggestions);
      setShowQuickActions(true);
    } else if (value.length === 0) {
      setShowQuickActions(false);
      setContextualSuggestions([]);
    }
  };

  // Generate smart suggestions based on user input
  const generateContextualSuggestions = (input: string): string[] => {
    const lowercaseInput = input.toLowerCase();
    const suggestions: string[] = [];
    
    // Skill-related suggestions
    if (lowercaseInput.includes('skill') || lowercaseInput.includes('tech') || lowercaseInput.includes('know')) {
      suggestions.push('What are your technical skills?', 'Tell me about your AI expertise');
    }
    
    // Project-related suggestions
    if (lowercaseInput.includes('project') || lowercaseInput.includes('work') || lowercaseInput.includes('portfolio')) {
      suggestions.push('Show me your best projects', 'What kind of projects have you worked on?');
    }
    
    // Contact-related suggestions
    if (lowercaseInput.includes('contact') || lowercaseInput.includes('hire') || lowercaseInput.includes('email')) {
      suggestions.push('How can I contact you?', 'Are you available for projects?');
    }
    
    // Experience-related suggestions
    if (lowercaseInput.includes('experience') || lowercaseInput.includes('background') || lowercaseInput.includes('career')) {
      suggestions.push('Tell me about your experience', 'What is your background?');
    }
    
    // AI-related suggestions
    if (lowercaseInput.includes('ai') || lowercaseInput.includes('artificial') || lowercaseInput.includes('machine')) {
      suggestions.push('How do you use AI in design?', 'What is AI-driven UX?');
    }
    
    // If no specific matches, provide general suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        'What makes you unique as a designer?',
        'Tell me about your design philosophy',
        'What are you working on currently?'
      );
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };
  // Handle escape key to clear/close chat
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && chatOpen) {
      setChatOpen(false);
      setCurrentAiResponse('');
      setAiThinking(false);
      setIsInputFocused(false);
    }
  };
  // Enhanced input focus handling
  const handleInputFocus = () => {
    setIsInputFocused(true);
    setChatOpen(true); // Always open chat when focusing on input
    if (search.length === 0) {
      setShowQuickActions(false); // Don't show dropdown when chat is open
    }
  };

  const handleInputBlur = () => {
    // Delay blur to allow suggestion clicks
    setTimeout(() => {
      setIsInputFocused(false);
      if (search.length === 0) {
        setShowQuickActions(false);
      }
    }, 150);
  };  // Handle suggestion click with animation
  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setShowQuickActions(false);
    setContextualSuggestions([]);
    // Small delay for visual feedback
    setTimeout(() => {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
  };

  // Clear entire chat history
  const clearChat = () => {
    setChatMessages([]);
    setCurrentAiResponse('');
    setAiThinking(false);
  };  // Nav items - will render icons dynamically with selected state
  const navItems = [
    { href: '/', label: 'Home', IconComponent: HomeIcon, hasInteractive: false },
    { href: '/about', label: 'About', IconComponent: AboutIcon, hasInteractive: true },
    { href: '/work', label: 'Work', IconComponent: WorkIcon, hasInteractive: true },
    { href: '/case-studies', label: 'Studies', IconComponent: StudiesIcon, hasInteractive: true },
    { href: '/contact', label: 'Contact', IconComponent: ContactIcon, hasInteractive: true },
  ];// Navigation item styling with strikethrough/bold logic
  const getNavItemClass = (idx: number) => {
    const isActive = mounted && pathname === navItems[idx].href;
    const isHovered = activeIndex === idx;
    
    let cls = 'flex flex-col items-center justify-center px-3 py-2 cursor-pointer transition-all duration-200 outline-none min-h-[60px]';
    
    // Remove spring animations, keep only subtle transitions
    if (isActive) {
      cls += ' font-bold';
    }
    
    return cls;
  };

  // Get text styling for nav labels
  const getTextClass = (idx: number) => {
    const isActive = mounted && pathname === navItems[idx].href;
    const isHovered = activeIndex === idx;
    
    let cls = 'text-xs mt-1 nav-menu-item select-none transition-all duration-200';
    
    if (isActive) {
      cls += ' font-bold text-black';
    } else if (isHovered) {
      cls += ' text-black'; // Remove strikethrough on hover
    } else {
      cls += ' line-through text-gray-500'; // Strikethrough for non-active items
    }
    
    return cls;
  };
  // Handle hover/focus/blur for nav items
  const handleNavMouseEnter = (idx: number) => setActiveIndex(idx);
  const handleNavMouseLeave = () => setActiveIndex(null);
  const handleNavClick = (idx: number) => {
    // Remove bouncing animation
    // Just navigate directly
  };

  // Keyboard navigation
  const handleNavKeyDown = (e: React.KeyboardEvent, idx: number, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleNavClick(idx);
      window.location.href = href;
    }
  };

  return (    <nav
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 pb-4"
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
    >      <div
        className="relative flex items-center justify-between bg-white/90 border border-black rounded-2xl shadow-none py-3 px-4 backdrop-blur-md sketch-border transition-all duration-200 hover:shadow-lg hover:sketch-border-thick"
        style={{ boxShadow: 'none', borderColor: '#000', borderWidth: 2 }}
      >
        {/* Nav items */}
        <div className="flex-1 flex items-center justify-between">
          {navItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={0}
              aria-label={item.label}
              className={getNavItemClass(idx)}
              onMouseEnter={() => handleNavMouseEnter(idx)}
              onMouseLeave={handleNavMouseLeave}
              onFocus={() => handleNavMouseEnter(idx)}
              onBlur={handleNavMouseLeave}
              onClick={() => handleNavClick(idx)}
              onKeyDown={e => handleNavKeyDown(e, idx, item.href)}
            >
              <item.IconComponent selected={mounted && pathname === item.href} />
              <span className={getTextClass(idx)} style={{ letterSpacing: 0 }}>
                {item.label}
              </span>
            </a>
          ))}
          {/* Removed InteractiveEye icon button from navbar */}
        </div>        {/* AI Search Bar */}
        <div className="relative ml-4">
          <form
            className={`flex items-center bg-black border-2 border-yellow-300 rounded-full px-3 py-2 sketch-border transition-all duration-200 ${
              isInputFocused ? 'sketch-border-thick shadow-md' : ''
            } ${isTyping ? 'border-blue-500' : ''}`}
            style={{ minWidth: 180, maxWidth: 260 }}
            onSubmit={handleSearch}
            role="search"
          >            <button
              type="submit"
              className="mr-2 p-1 transition-all duration-200 flex items-center justify-center relative rounded-full bg-yellow-400 text-black font-bold border-2 border-yellow-600 hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-400"
              aria-label="Ask about me"
              tabIndex={0}onClick={(e) => {
                // Always open chat when clicking the icon
                setChatOpen(!chatOpen);
                // If there are no messages, show welcome screen with suggestions
                if (chatMessages.length === 0 && !aiThinking && e.type === 'click') {
                  e.preventDefault();
                }
              }}
            >
              <ChatIcon className={`w-5 h-5 transition-colors ${
                aiThinking ? 'animate-pulse text-blue-500' : 
                isTyping ? 'text-blue-600' : 'text-black'
              }`} />
              {/* Message count indicator */}
              {chatMessages.length > 0 && (                <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center handwritten animate-bounce-once">
                  {chatMessages.length}
                </div>
              )}
              {/* Typing indicator pulse */}
              {isTyping && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
              )}
            </button>            <input
              ref={inputRef}
              type="text"
              className="bg-black text-white outline-none border-none search-input-enhanced text-sm w-full transition-all duration-200 font-bold px-3 py-2 rounded-full"
              placeholder={isInputFocused ? "Type your question..." : "Ask about me..."}
              value={search}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch(e as any);
                } else if (e.key === 'Escape') {
                  handleKeyDown(e);
                }
              }}
              aria-label="Ask about Arun Kumar"
              aria-expanded={showQuickActions}
              aria-describedby="search-suggestions"
              disabled={aiThinking}
            />
            {/* Loading indicator inside input */}
            {aiThinking && (
              <div className="ml-2 flex space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </form>          {/* Contextual Quick Suggestions - Only show when typing */}
          {showQuickActions && search.length > 0 && contextualSuggestions.length > 0 && (
            <div 
              id="search-suggestions"
              className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden animate-fade-in"
              role="listbox"
              aria-label="Quick suggestions"
            >
              <div className="p-2">
                <div className="text-xs text-gray-500 font-mono mb-2 px-2">💡 Suggestions based on your input:</div>
                {contextualSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 focus:border-blue-400 focus:outline-none"
                    role="option"
                    aria-selected="false"
                    tabIndex={0}
                  >
                    <span className="text-blue-600">→</span> {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>      {/* Chat Interface */}
      {chatOpen && (
        <div className="absolute left-1/2 bottom-36 transform -translate-x-1/2 z-50 w-full max-w-lg flex justify-center pointer-events-none">
          <div className="bg-white border-2 border-black rounded-xl shadow-2xl pointer-events-auto mx-4 w-full max-h-96 overflow-hidden animate-chat-enter backdrop-blur-sm">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <ChatIcon className={`w-4 h-4 transition-all duration-300 ${
                    aiThinking ? 'animate-pulse text-blue-500' : 'text-gray-700'
                  }`} />
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
                    aiThinking ? 'bg-blue-500 animate-pulse' : 
                    chatMessages.length > 0 ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>                <div className="flex flex-col">                  <span className="heading-tertiary-enhanced text-xs font-bold text-gray-800">Arun's AI Assistant</span>
                  <span className={`text-xs chat-typing-indicator transition-colors ${
                    aiThinking ? 'text-blue-500' : 
                    chatMessages.length > 0 ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {aiThinking ? '● Thinking...' : 
                     chatMessages.length > 0 ? '● Ready to help' : '● Online'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Chat stats */}
                {chatMessages.length > 0 && (                  <span className="text-xs text-gray-500 handwritten px-2 py-1 bg-gray-100 rounded-full">
                    {chatMessages.length} msg{chatMessages.length !== 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={clearChat}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  aria-label="Clear chat"
                  title="Clear conversation"                >
                  <ClearIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-50"
                  aria-label="Close chat"
                  title="Close chat (ESC)"
                >
                  <span className="text-sm">×</span>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatMessagesRef}
              className="p-4 space-y-4 max-h-72 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Welcome message when chat is empty */}
              {chatMessages.length === 0 && !currentAiResponse && !aiThinking && (
                <div className="text-center text-gray-500 py-6 animate-fade-in">
                  <div className="mb-4 text-2xl">👋</div>
                  <div className="mb-3 font-semibold">Hi! I'm Arun's AI assistant</div>
                  <div className="text-xs mb-4 text-gray-400">Ask me anything about his skills, projects, or experience</div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { text: 'What are your skills?', icon: '🛠️', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                      { text: 'Tell me about your projects', icon: '💼', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                      { text: 'How can I contact you?', icon: '📧', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
                      { text: 'What makes you unique?', icon: '✨', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
                      { text: 'Tell me a fun fact', icon: '🎉', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' }
                    ].map((suggestion, index) => (
                      <button
                        key={suggestion.text}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className={`px-3 py-2 text-xs ${suggestion.color} rounded-lg border transition-all duration-200 flex items-center gap-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 animate-fade-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        tabIndex={0}
                      >
                        <span>{suggestion.icon}</span>
                        <span>{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-message-enter`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`max-w-[80%] relative group ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message bubble */}                    <div
                      className={`px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                        message.type === 'user'
                          ? 'bg-black text-white border-black rounded-br-md chat-message-user'
                          : 'bg-gray-50 text-black border-gray-200 rounded-bl-md hover:bg-gray-100 chat-message-ai'
                      }`}
                    >
                      {message.content}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-xs text-gray-400 mt-1 ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Current AI Response (being typed) */}
              {currentAiResponse && (
                <div className="flex justify-start animate-message-enter">
                  <div className="max-w-[80%] relative">                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-gray-50 text-black border-2 border-blue-200 rounded-bl-md animate-pulse-subtle">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 scribbled-text">
                          {currentAiResponse}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking indicator */}
              {aiThinking && !currentAiResponse && (
                <div className="flex justify-start animate-message-enter">
                  <div className="max-w-xs">
                    <div className="px-4 py-3 rounded-2xl bg-gray-50 text-gray-400 border-2 border-gray-200 rounded-bl-md">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>            {/* Chat Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    {chatMessages.length > 0 ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        New conversation
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd>
                  <span>to close</span>
                  <span>•</span>
                  <button 
                    onClick={clearChat}
                    className="hover:text-red-500 transition-colors underline decoration-dotted"
                    disabled={chatMessages.length === 0}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Enhanced CSS Animations */}
      <style>
        {`
        .animate-wiggle { animation: wiggle 0.3s; }
        .animate-bounce { animation: bounce 0.5s cubic-bezier(.28,.84,.42,1) 1; }
        .animate-bounce-once { animation: bounceOnce 0.6s ease-out; }
        .animate-spin-scribble { animation: spin 1s linear infinite; }
        .animate-scribble-text { animation: draw 1.2s steps(40) 1; }
        .animate-chat-enter { animation: chatEnter 0.4s ease-out; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-message-enter { animation: messageEnter 0.3s ease-out; }
        .animate-pulse-subtle { animation: pulseSubtle 2s ease-in-out infinite; }
        
        /* Scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { 
          background-color: #d1d5db; 
          border-radius: 2px; 
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track { 
          background-color: #f3f4f6; 
        }
        
        /* Enhanced keyframes */
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        
        @keyframes bounce {
          0% { transform: translateY(0); }
          30% { transform: translateY(-12px); }
          50% { transform: translateY(0); }
          70% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes bounceOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        
        @keyframes draw {
          0% { stroke-dasharray: 0 100; }
          100% { stroke-dasharray: 100 0; }
        }
        
        @keyframes chatEnter {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes fadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes messageEnter {
          0% { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes pulseSubtle {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.2); 
          }
          50% { 
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); 
          }
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .animate-chat-enter {
            animation: chatEnterMobile 0.3s ease-out;
          }
        }
        
        @keyframes chatEnterMobile {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        `}
      </style>
    </nav>
  );
};

export default Navigation;
