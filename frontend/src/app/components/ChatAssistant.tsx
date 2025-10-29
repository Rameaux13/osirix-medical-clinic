'use client';

import React, { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import type { ChatMessage } from '../../services/chatService';

// Icônes SVG
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

interface ChatAssistantProps {
    onNavigate?: (section: string) => void;
}

export default function ChatAssistant({ onNavigate }: ChatAssistantProps) {
    // ============================================
    // 📱 NOUVEAU : Détection taille écran
    // ============================================
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    // Scroll automatique vers le bas
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // Fonction pour envoyer un message
    const handleSendMessage = async () => {
        if (chatMessage.trim() && !chatLoading) {
            // Message utilisateur
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
                // Appel API backend
                const response = await chatService.sendMessage(userMessage.message);

                // Message assistant avec réponse du backend
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

    // Fonction pour envoyer une suggestion avec redirection si c'est "Prendre RDV"
    const handleSuggestionClick = async (suggestion: string) => {
        // Si c'est "Prendre RDV maintenant", rediriger directement
        if (suggestion === 'Prendre RDV maintenant' && onNavigate) {
            onNavigate('new-appointment');
            setIsChatOpen(false);
            return;
        }

        // Sinon, envoyer le message normalement
        setChatMessage(suggestion);
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    return (
        <>
            {/* Fenêtre de chat */}
            {isChatOpen && (
                <div
                    className={`
                      fixed bg-white shadow-2xl border border-gray-200 z-50 flex flex-col
                         ${isMobile 
                            ? 'bottom-32 left-4 right-4 h-[50vh] max-w-md mx-auto rounded-2xl' 
                            : 'bottom-24 right-6 w-96 h-[500px] rounded-2xl'
                                }
                            `}
                >
                    {/* Header du chat */}
                    <div className="bg-gradient-to-r from-[#006D65] to-[#00806E] text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Assistant OSIRIX</h4>
                                <p className="text-xs text-green-200">En ligne</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages du chat */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {chatMessages.map((msg) => (
                            <div key={msg.id}>
                                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[75%] p-3 rounded-lg text-sm ${msg.type === 'user'
                                            ? 'bg-[#006D65] text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="whitespace-pre-line">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-green-200' : 'text-gray-500'}`}>
                                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Suggestions de l'assistant */}
                                {msg.type === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-2">
                                        {msg.suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                disabled={chatLoading}
                                                className="text-xs bg-[#006D65]/10 text-[#006D65] px-3 py-1 rounded-full hover:bg-[#006D65]/20 transition-colors border border-[#006D65]/30 disabled:opacity-50"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Indicateur de chargement */}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input du chat */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                placeholder="Tapez votre message..."
                                disabled={chatLoading}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006D65] focus:border-transparent disabled:opacity-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatMessage.trim() || chatLoading}
                                className="bg-[#006D65] text-white p-2 rounded-lg hover:bg-[#005a54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {chatLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bouton flottant du chat - MODIFIÉ POUR RESPONSIVE */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`
                    fixed rounded-full shadow-lg transition-all duration-300 z-40
                    ${isMobile ? 'bottom-4 right-4 w-12 h-12' : 'bottom-6 right-6 w-14 h-14'}
                    ${isChatOpen
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-gradient-to-r from-[#006D65] to-[#00806E] hover:shadow-xl hover:scale-105'
                    }
                `}
            >
                {isChatOpen ? (
                    <X className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white mx-auto`} />
                ) : (
                    <MessageCircle className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white mx-auto`} />
                )}
            </button>
        </>
    );
}