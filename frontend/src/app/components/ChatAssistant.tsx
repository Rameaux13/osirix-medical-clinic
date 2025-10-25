'use client';

import React, { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import type { ChatMessage } from '../../services/chatService';

// ============================================
// 🎨 ICÔNES SVG
// ============================================
const MessageCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const X = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Send = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

const BotIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

interface ChatAssistantProps {
    onNavigate?: (section: string) => void;
}

export default function ChatAssistant({ onNavigate }: ChatAssistantProps) {
    console.log('🤖 ChatAssistant - Composant monté');

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            type: 'assistant',
            message: 'Bonjour ! Je suis votre assistant virtuel OSIRIX. Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date(),
            suggestions: ['Prendre RDV', 'Voir les services']
        }
    ]);
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ============================================
    // 📱 DÉTECTION DE LA TAILLE D'ÉCRAN
    // ============================================
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            console.log('📱 Taille écran:', window.innerWidth, 'px - Mobile:', mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ============================================
    // 📜 SCROLL AUTOMATIQUE AMÉLIORÉ
    // ============================================
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        console.log('📜 Scroll vers le bas');
    };

    useEffect(() => {
        if (isChatOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [chatMessages, isChatOpen]);

    // ============================================
    // 💬 ENVOI DE MESSAGE
    // ============================================
    const handleSendMessage = async () => {
        if (chatMessage.trim() && !chatLoading) {
            console.log('💬 Envoi message:', chatMessage);

            const userMessage: ChatMessage = {
                id: chatMessages.length + 1,
                type: 'user',
                message: chatMessage,
                timestamp: new Date()
            };

            setChatMessages(prev => [...prev, userMessage]);
            setChatMessage('');
            setChatLoading(true);

            try {
                console.log('🔄 Appel API backend...');
                const response = await chatService.sendMessage(userMessage.message);
                console.log('✅ Réponse reçue:', response);

                const assistantMessage: ChatMessage = {
                    id: chatMessages.length + 2,
                    type: 'assistant',
                    message: response.response,
                    timestamp: new Date(),
                    suggestions: response.suggestions,
                    action: response.action
                };

                setChatMessages(prev => [...prev, assistantMessage]);

            } catch (error) {
                console.error('❌ Erreur chat:', error);

                const errorMessage: ChatMessage = {
                    id: chatMessages.length + 2,
                    type: 'assistant',
                    message: 'Désolé, une erreur s\'est produite. Veuillez réessayer ou nous contacter au +225 XX XX XX XX.',
                    timestamp: new Date(),
                    suggestions: ['Réessayer', 'Prendre RDV']
                };

                setChatMessages(prev => [...prev, errorMessage]);
            } finally {
                setChatLoading(false);
            }
        }
    };

    // ============================================
    // 🎯 GESTION DES SUGGESTIONS
    // ============================================
    const handleSuggestionClick = async (suggestion: string) => {
        console.log('🎯 Suggestion cliquée:', suggestion);

        if (suggestion === 'Prendre RDV maintenant' && onNavigate) {
            console.log('↗️ Redirection vers prise de RDV');
            onNavigate('new-appointment');
            setIsChatOpen(false);
            return;
        }

        setChatMessage(suggestion);
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    // ============================================
    // ✨ ANIMATION D'OUVERTURE
    // ============================================
    useEffect(() => {
        if (isChatOpen) {
            console.log('✅ Chat ouvert');
        } else {
            console.log('❌ Chat fermé');
        }
    }, [isChatOpen]);

    return (
        <>
            {/* ============================================ */}
            {/* 💬 FENÊTRE DE CHAT */}
            {/* ============================================ */}
            {isChatOpen && (
                <div 
                    className={`
                        fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col
                        transition-all duration-300 ease-in-out
                        ${isMobile 
                            ? 'inset-0 rounded-none' 
                            : 'bottom-24 right-6 w-96 h-[500px] rounded-2xl'
                        }
                    `}
                    style={{ 
                        animation: 'slideUp 0.3s ease-out',
                    }}
                >
                    {/* ============================================ */}
                    {/* 📋 HEADER DU CHAT */}
                    {/* ============================================ */}
                    <div className="bg-gradient-to-r from-[#006D65] to-[#00806E] text-white p-4 flex items-center justify-between rounded-t-2xl md:rounded-t-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-base">Assistant OSIRIX</h4>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <p className="text-xs text-green-200">En ligne</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ============================================ */}
                    {/* 📝 ZONE DES MESSAGES */}
                    {/* ============================================ */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                        {chatMessages.map((msg) => (
                            <div key={msg.id}>
                                {/* Message */}
                                <div className={`flex items-end space-x-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    
                                    {/* Avatar Assistant */}
                                    {msg.type === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-[#006D65] flex items-center justify-center flex-shrink-0 shadow-md">
                                            <BotIcon className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    {/* Bulle de message */}
                                    <div
                                        className={`
                                            max-w-[80%] md:max-w-[75%] p-3 rounded-2xl shadow-md
                                            ${msg.type === 'user'
                                                ? 'bg-gradient-to-br from-[#006D65] to-[#00806E] text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                                            }
                                        `}
                                        style={{
                                            animation: 'fadeIn 0.3s ease-out'
                                        }}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
                                        <p className={`text-xs mt-1.5 ${msg.type === 'user' ? 'text-green-200' : 'text-gray-500'}`}>
                                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Avatar User */}
                                    {msg.type === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-[#E6A930] flex items-center justify-center flex-shrink-0 shadow-md">
                                            <UserIcon className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* ============================================ */}
                                {/* 🎯 SUGGESTIONS */}
                                {/* ============================================ */}
                                {msg.type === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-10">
                                        {msg.suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                disabled={chatLoading}
                                                className="
                                                    text-xs bg-[#006D65]/10 text-[#006D65] px-3 py-1.5 rounded-full 
                                                    hover:bg-[#006D65]/20 transition-all duration-200 
                                                    border border-[#006D65]/30 disabled:opacity-50
                                                    hover:scale-105 hover:shadow-md
                                                "
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* ============================================ */}
                        {/* ⏳ INDICATEUR "EN TRAIN D'ÉCRIRE..." */}
                        {/* ============================================ */}
                        {chatLoading && (
                            <div className="flex items-end space-x-2">
                                <div className="w-8 h-8 rounded-full bg-[#006D65] flex items-center justify-center flex-shrink-0 shadow-md">
                                    <BotIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-md border border-gray-200">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-[#006D65] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#006D65] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-[#006D65] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ============================================ */}
                    {/* ⌨️ ZONE D'INPUT */}
                    {/* ============================================ */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Tapez votre message..."
                                disabled={chatLoading}
                                className="
                                    flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm 
                                    focus:ring-2 focus:ring-[#006D65] focus:border-transparent 
                                    disabled:opacity-50 disabled:bg-gray-50
                                    transition-all duration-200
                                "
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatMessage.trim() || chatLoading}
                                className="
                                    bg-gradient-to-r from-[#006D65] to-[#00806E] text-white 
                                    p-3 rounded-xl hover:shadow-lg transition-all duration-200 
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    hover:scale-105 active:scale-95
                                "
                            >
                                {chatLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* 🎈 BOUTON FLOTTANT */}
            {/* ============================================ */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`
                    fixed z-40 rounded-full shadow-lg transition-all duration-300
                    ${isMobile ? 'bottom-4 right-4 w-14 h-14' : 'bottom-6 right-6 w-16 h-16'}
                    ${isChatOpen
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-gradient-to-r from-[#006D65] to-[#00806E] hover:shadow-xl hover:scale-110 animate-bounce-slow'
                    }
                `}
                style={{
                    animation: !isChatOpen ? 'bounce-slow 2s infinite' : 'none'
                }}
            >
                {isChatOpen ? (
                    <X className="w-6 h-6 text-white mx-auto" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white mx-auto" />
                )}
            </button>

            {/* ============================================ */}
            {/* 🎨 ANIMATIONS CSS */}
            {/* ============================================ */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </>
    );
}