import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, X, Bot, User, CheckCircle2, AlertCircle, 
  ArrowRight, Loader2, RefreshCw, MessageSquare
} from 'lucide-react';
import { EventItem, ChatMessage, ProposedEventChange } from '../types';
import { api } from '../services/api';

interface AIAssistantDrawerProps {
  event?: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: (updatedEvent: EventItem) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  event,
  isOpen,
  onClose,
  onEventUpdated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingChange, setConfirmingChange] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial welcome message
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            message: event 
              ? `Hello! I am your EventEase AI planning director for **${event.event_name}**. How can I assist with your ${event.event_type} today? Ask about cost optimization, timeline milestones, or menu planning.`
              : `Hello! I am EventEase AI, your personal celebration planning assistant. Ask me anything about budgeting, themes, or event logistics.`,
          }
        ]);
      }
    }
  }, [isOpen, event]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', message: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(text, event?.id);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: 'I encountered an issue processing your request. Please try again.',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmChange = async (proposal: ProposedEventChange) => {
    if (!event) return;
    setConfirmingChange(proposal.description);
    try {
      await api.confirmEventChange(event.id, proposal.change_type, proposal.payload);
      // Fetch updated event
      const updated = await api.getEvent(event.id);
      if (onEventUpdated) onEventUpdated(updated);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: `Successfully applied: **${proposal.description}**. Your event parameters have been updated.`,
        }
      ]);
    } catch (err) {
      console.error(err);
      alert('Failed to apply the confirmed change.');
    } finally {
      setConfirmingChange(null);
    }
  };

  const quickQuestions = event ? [
    `How can I reduce decoration costs for ${event.event_name}?`,
    `I want to add another 50 guests. Recalculate my budget.`,
    `Suggest a South Indian wedding theme.`,
    `What tasks should I complete this week?`,
    `I have ${event.guest_count} guests. How much food should I arrange?`
  ] : [
    "What are the typical cost percentages for a wedding budget?",
    "Suggest affordable milestone birthday party activities.",
    "How early should I book corporate event venues?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-luxury border-l border-purple-100 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50/70 to-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-soft">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base font-serif flex items-center">
              EventEase Assistant <span className="ml-2 text-[10px] bg-purple-100 text-brand-800 px-2 py-0.5 rounded-full font-sans font-semibold">Gemini 2.5</span>
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[240px]">
              {event ? `Context: ${event.event_name}` : 'General Advisory Mode'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-purple-50 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                isUser ? 'bg-brand-600 text-white' : 'bg-purple-100 text-brand-700'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] rounded-2xl p-4 space-y-2 ${
                isUser
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none shadow-soft'
                  : 'bg-[#FAF8FF] text-slate-800 border border-purple-100/90 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.message}
                </div>

                {/* Proposed Changes Cards (User approval required) */}
                {msg.proposed_changes && msg.proposed_changes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                      Proposed Plan Modification:
                    </span>
                    {msg.proposed_changes.map((prop, pi) => (
                      <div
                        key={pi}
                        className="bg-white p-3 rounded-xl border border-purple-200 shadow-xs space-y-2 text-xs"
                      >
                        <p className="font-semibold text-slate-800">{prop.description}</p>
                        <button
                          onClick={() => handleConfirmChange(prop)}
                          disabled={confirmingChange === prop.description}
                          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-xs shadow-soft transition-colors disabled:opacity-50"
                        >
                          {confirmingChange === prop.description ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm & Apply Change</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-10">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Assistant is reasoning with event parameters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 border-t border-purple-50 bg-[#FAF8FF] overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex space-x-2">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium text-brand-800 bg-white hover:bg-purple-100/70 border border-purple-200/80 px-3 py-1 rounded-full transition-colors flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-purple-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about decor, food ratios, budgets..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition-colors shadow-soft"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          EventEase AI estimates are market-calibrated; vendor quotes should be confirmed directly.
        </p>
      </div>

    </div>
  );
};

