import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Settings, Plus, Edit2, Trash2, Copy, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  model?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface LLMModel {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

const ChatInterface = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    }
  ]);
  
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [selectedModel, setSelectedModel] = useState('openai');
  const [inputMessage, setInputMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [models, setModels] = useState<LLMModel[]>([
    { id: 'openai', name: 'OpenAI', icon: '🧠', color: 'text-green-600' },
    { id: 'groq', name: 'Groq', icon: '⚡', color: 'text-orange-600' },
    { id: 'gemini', name: 'Gemini', icon: '✨', color: 'text-purple-600' },
    { id: 'deepseek', name: 'DeepSeek', icon: '🔍', color: 'text-blue-600' }
  ]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const addCustomModel = () => {
    if (!newModelName.trim()) return;
    
    const newModel: LLMModel = {
      id: newModelName.toLowerCase().replace(/\s+/g, '-'),
      name: newModelName,
      icon: '🤖',
      color: 'text-gray-600',
      isCustom: true
    };
    
    setModels(prev => [...prev, newModel]);
    setNewModelName('');
    setShowAddModel(false);
  };

  const removeCustomModel = (modelId: string) => {
    setModels(prev => prev.filter(m => m.id !== modelId));
    if (selectedModel === modelId) {
      setSelectedModel('openai');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: [...session.messages, newMessage] }
        : session
    ));

    setInputMessage('');

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated response from ${models.find(m => m.id === selectedModel)?.name}. In a real implementation, this would be connected to the actual API.`,
        sender: 'bot',
        timestamp: new Date(),
        model: selectedModel
      };

      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, botMessage] }
          : session
      ));
    }, 1000);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (sessionId: string) => {
    if (sessions.length === 1) return;
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = (messageId: string) => {
    console.log('Regenerating response for message:', messageId);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="sidebar-header">
          <button 
            onClick={createNewSession}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`sidebar-link group flex items-center justify-between ${
                session.id === currentSessionId ? 'active' : ''
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {/* Header */}
        <div className="chat-header">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              <Settings className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Chat Assistant</h1>
          </div>
          
          {/* Model Selector */}
          <div className="flex items-center space-x-3">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{models.find(m => m.id === selectedModel)?.icon}</span>
                    <span>{models.find(m => m.id === selectedModel)?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg border">
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id} className="flex items-center">
                    <div className="flex items-center space-x-2 py-1">
                      <span className="text-lg">{model.icon}</span>
                      <span>{model.name}</span>
                      {model.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomModel(model.id);
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!showAddModel ? (
              <Button
                onClick={() => setShowAddModel(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Model</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="Model name"
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomModel();
                    } else if (e.key === 'Escape') {
                      setShowAddModel(false);
                      setNewModelName('');
                    }
                  }}
                  autoFocus
                />
                <Button onClick={addCustomModel} size="sm" variant="default">
                  Add
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddModel(false);
                    setNewModelName('');
                  }} 
                  size="sm" 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {currentSession?.messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className={`message-content ${message.sender} group relative`}>
                {message.sender === 'bot' && (
                  <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500">
                    <span className={models.find(m => m.id === message.model)?.color}>
                      {models.find(m => m.id === message.model)?.icon}
                    </span>
                    <span>{models.find(m => m.id === message.model)?.name}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.sender === 'bot' && (
                  <div className="flex space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => regenerateResponse(message.id)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      title="Regenerate"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <div className="max-w-3xl mx-auto">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message here..."
                className="chat-input"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
