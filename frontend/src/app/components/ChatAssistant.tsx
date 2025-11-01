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
    // 📱 Détection taille écran
    // ============================================
    const [isMobile, setIsMobile] = useState(false);

    // ============================================
    // 🌓 NOUVEAU : Détection du mode sombre
    // ============================================
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ============================================
    // 🌓 Détection et synchronisation du thème
    // ============================================
    useEffect(() => {
        const checkDarkMode = () => {
            // Vérifier si la classe 'dark' est présente sur le html ou body
            const isDark = document.documentElement.classList.contains('dark') || 
                          document.body.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        // Vérification initiale
        checkDarkMode();

        // Observer les changements de classe sur le document
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
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
                      fixed shadow-2xl border z-50 flex flex-col transition-all duration-300
                         ${isMobile
                            ? 'bottom-32 left-4 right-4 h-[50vh] max-w-md mx-auto rounded-2xl'
                            : 'bottom-24 right-6 w-96 h-[500px] rounded-2xl'
                        }
                        ${isDarkMode 
                            ? 'bg-gray-800 border-gray-600 shadow-gray-900/50' 
                            : 'bg-white border-gray-200'
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
                    <div className={`flex-1 p-4 overflow-y-auto space-y-3 transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}>
                        {chatMessages.map((msg) => (
                            <div key={msg.id}>
                                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[75%] p-3 rounded-lg text-sm transition-colors duration-300 ${
                                            msg.type === 'user'
                                                ? 'bg-[#006D65] text-white rounded-br-none shadow-md'
                                                : isDarkMode
                                                    ? 'bg-gray-700 text-gray-100 rounded-bl-none shadow-sm border border-gray-600'
                                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                                        }`}
                                    >
                                        <p className="whitespace-pre-line">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${
                                            msg.type === 'user' 
                                                ? 'text-green-200' 
                                                : isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
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
                                                className={`text-xs px-3 py-1 rounded-full transition-colors border disabled:opacity-50 ${
                                                    isDarkMode
                                                        ? 'bg-[#006D65]/20 text-[#00c4b8] hover:bg-[#006D65]/30 border-[#006D65]/50'
                                                        : 'bg-[#006D65]/10 text-[#006D65] hover:bg-[#006D65]/20 border-[#006D65]/30'
                                                }`}
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
                                <div className={`p-3 rounded-lg rounded-bl-none shadow-sm border transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600'
                                        : 'bg-white border-gray-200'
                                }`}>
                                    <div className="flex space-x-1">
                                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                                            isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                                        }`}></div>
                                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                                            isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                                        }`} style={{ animationDelay: '0.1s' }}></div>
                                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                                            isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                                        }`} style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input du chat */}
                    <div className={`p-4 border-t transition-colors duration-300 ${
                        isDarkMode 
                            ? 'border-gray-700 bg-gray-800' 
                            : 'border-gray-200 bg-white'
                    }`}>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                placeholder="Tapez votre message..."
                                disabled={chatLoading}
                                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent disabled:opacity-50 transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-[#00c4b8]'
                                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-[#006D65]'
                                }`}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatMessage.trim() || chatLoading}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                                    isDarkMode
                                        ? 'bg-[#007a71] hover:bg-[#005a54] text-white'
                                        : 'bg-[#006D65] hover:bg-[#005a54] text-white'
                                }`}
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

            {/* Bouton flottant du chat */}
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