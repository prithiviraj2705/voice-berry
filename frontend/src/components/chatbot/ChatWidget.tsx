import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic } from 'lucide-react';
import { Button } from '../ui/button';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi Rajesh! I'm Ula Assistant. How can I help with your rides today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userText = input;
    const newMessages = [...messages, { id: Date.now(), text: userText, isBot: false }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    
    try {
      const apiMessages = newMessages.map(m => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text
      }));

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: data.reply, 
          isBot: true 
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent/90 text-primary rounded-full shadow-2xl flex items-center justify-center z-50 border-2 border-background"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col z-50 flex-shrink-0"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-serif font-bold text-xl">U</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-primary rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-cream leading-tight">Ula Assistant</h3>
                  <p className="text-xs text-primary-foreground/70">Powered by AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center transition-colors text-primary-foreground/70 hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.isBot 
                        ? 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm' 
                        : 'bg-primary text-primary-foreground rounded-tr-sm shadow-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border text-foreground p-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" size="sm" className="bg-card text-xs h-8 rounded-full border-accent/30 text-accent hover:bg-accent/10">
                  <Mic className="w-3 h-3 mr-1" /> Voice Book
                </Button>
                <Button variant="outline" size="sm" className="bg-card text-xs h-8 rounded-full border-border">
                  Quick Book
                </Button>
                <Button variant="outline" size="sm" className="bg-card text-xs h-8 rounded-full border-border">
                  Check Status
                </Button>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-border">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..." 
                  className="w-full bg-muted border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
