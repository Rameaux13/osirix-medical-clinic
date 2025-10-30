'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/store/auth';
import analysesService, { LabOrder, AnalysesStats } from '../../services/analysesService';

// Icônes SVG
const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Download = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface MesAnalysesProps {
  onNavigateToNewAppointment?: () => void;
}

export default function MesAnalyses({ onNavigateToNewAppointment }: MesAnalysesProps) {
  const { user } = useCurrentUser();

  // États
  const [analyses, setAnalyses] = useState<LabOrder[]>([]);
  const [stats, setStats] = useState<AnalysesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent'); // Par défaut : plus récent en premier

  // Chargement des données
  const loadAnalyses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [allAnalyses, statsData] = await Promise.all([
        analysesService.getMyAnalyses(),
        analysesService.getAnalysesStats(),
      ]);

      setAnalyses(allAnalyses);
      setStats(statsData);

    } catch (error: any) {
      setError(error.message || 'Impossible de charger vos analyses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user, loadAnalyses]);

  // Télécharger les résultats
  const handleDownloadResults = async (analysis: LabOrder) => {
    try {
      const results = await analysesService.downloadAnalysisResults(analysis.id);

      const content = `
RÉSULTATS D'ANALYSE - OSIRIX CLINIQUE MÉDICAL
=============================================

Patient: ${user?.firstName} ${user?.lastName}
Date de prescription: ${analysesService.formatDate(analysis.orderDate)}
Type d'examen: ${analysis.examType}
Médecin prescripteur: ${analysesService.formatDoctorName(analysis.doctor)}
Priorité: ${analysesService.translatePriority(analysis.priority)}

INSTRUCTIONS:
${analysis.instructions || 'Aucune instruction spécifique'}

RÉSULTATS:
${results.results || 'Résultats non disponibles'}

Date des résultats: ${results.resultsDate ? analysesService.formatDate(results.resultsDate) : 'Non disponible'}

---
Document généré automatiquement par OSIRIX CLINIQUE MÉDICAL
      `.trim();

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Analyse_${analysis.examType.replace(/\s+/g, '_')}_${analysesService.formatDate(analysis.orderDate).replace(/\//g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      alert('Impossible de télécharger les résultats');
    }
  };

  // Rendu d'une analyse
  const renderAnalysisItem = (analysis: LabOrder) => (
    <div key={analysis.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 hover:shadow-xl dark:hover:shadow-2xl hover:border-primary-500/40 dark:hover:border-primary-400/40 transition-all duration-300 bg-gradient-to-br from-white via-gray-50/50 to-primary-500/5 dark:from-gray-800 dark:via-gray-800/80 dark:to-primary-500/10 overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-center mb-3 min-w-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base lg:text-xl break-words group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{analysis.examType}</h4>
                <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                  <span>📅</span>
                  {analysesService.formatDate(analysis.orderDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Médecin */}
          {analysis.doctor && (
            <div className="flex items-center space-x-3 mb-4 bg-gradient-to-r from-primary-500/10 to-primary-500/5 dark:from-primary-500/20 dark:to-primary-500/10 rounded-xl p-3 md:p-4 min-w-0 border border-primary-500/20 dark:border-primary-400/30 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">
                  {analysesService.formatDoctorName(analysis.doctor)}
                </p>
                <p className="text-[10px] md:text-xs lg:text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                  <span>👨‍⚕️</span>
                  Médecin prescripteur
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {analysis.instructions && (
            <div className="mb-4">
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2 font-bold flex items-center gap-2">
                <span>📋</span>
                Instructions médicales :
              </p>
              <div className="text-xs md:text-sm lg:text-base text-gray-800 dark:text-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 md:p-4 border-l-4 border-primary-500 dark:border-primary-400 break-words overflow-wrap-anywhere shadow-sm hover:shadow-md transition-shadow duration-300">
                {analysis.instructions}
              </div>
            </div>
          )}

          {/* FICHIERS JOINTS */}
          {analysis.resultFiles && Array.isArray(analysis.resultFiles) && analysis.resultFiles.length > 0 && (
            <div className="mb-4 min-w-0">
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-bold mb-3 flex items-center gap-2">
                <span>📎</span>
                Fichiers joints ({analysis.resultFiles.length}) :
              </p>
              <div className="space-y-2 md:space-y-3">
                {analysis.resultFiles.map((filePath: any, index: number) => {
                  // Si c'est un string direct, utiliser directement
                  const fileUrl = typeof filePath === 'string' ? filePath : filePath.url;
                  const fileName = typeof filePath === 'string'
                    ? filePath.split('/').pop() || `Document ${index + 1}`
                    : filePath.name || `Document ${index + 1}`;
                  const fileType = typeof filePath === 'string'
                    ? (filePath.endsWith('.pdf') ? 'PDF' : 'Image')
                    : filePath.type || 'Fichier médical';

                  // Fonction pour télécharger ou visualiser le fichier
                  // Fonction pour télécharger ou visualiser le fichier
                  const handleDownload = async (e: React.MouseEvent) => {
                    e.preventDefault();
                    const fullUrl = analysesService.getFileUrl(fileUrl);

                    // Téléchargement pour TOUS les types de fichiers (PDF, images, etc.)
                    try {
                      const response = await fetch(fullUrl, { mode: 'cors' });
                      if (!response.ok) throw new Error('Erreur de téléchargement');

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      alert('Impossible de télécharger le fichier');
                      // Fallback: ouvrir dans un nouvel onglet
                      window.open(fullUrl, '_blank');
                    }
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 md:gap-3 lg:gap-4 bg-gradient-to-r from-secondary-500/10 to-secondary-500/5 dark:from-secondary-500/20 dark:to-secondary-500/10 rounded-xl p-3 md:p-4 border border-secondary-500/30 dark:border-secondary-400/40 hover:border-secondary-500 dark:hover:border-secondary-400 hover:shadow-md dark:hover:shadow-xl transition-all duration-300 group min-w-0"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 dark:from-secondary-400 dark:to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">{fileName}</p>
                        <p className="text-[10px] md:text-xs text-secondary-600 dark:text-secondary-400 font-medium">{fileType}</p>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="flex-shrink-0 p-2 md:p-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-400 dark:hover:bg-secondary-500 transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-110"
                        title="Télécharger le fichier"
                        aria-label={`Télécharger ${fileName}`}
                      >
                        <Download className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl p-4 md:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 md:w-1/3"></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div className="h-20 md:h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 md:h-32 lg:h-36 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-card theme-transition rounded-xl shadow-theme-lg p-4 md:p-8 border border-theme">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 pb-4 border-b-2 border-theme gap-3">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-theme-primary theme-transition flex items-center gap-2 md:gap-3">
          <span className="text-2xl md:text-3xl">🩺</span>
          <span>Mes Analyses Médicales</span>
        </h2>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300">
          <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 animate-shake">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 font-medium text-sm md:text-base">{error}</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="bg-gradient-to-br from-primary-500/10 via-white dark:via-gray-800 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 border-2 border-primary-500/20 dark:border-primary-400/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 rounded-full mb-3 md:mb-4 shadow-xl hover:scale-110 transition-transform duration-300">
                <p className="text-2xl md:text-3xl font-black text-white">{stats.total}</p>
              </div>
              <p className="text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300 font-bold mt-2">
                <span className="mr-2">📊</span>
                Total analyses médicales
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <label htmlFor="sortOrder" className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
          Trier par :
        </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
          className="w-full sm:w-auto px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-500 dark:hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
        >
          <option value="recent">Du plus récent au moins récent</option>
          <option value="oldest">Du moins récent au plus récent</option>
        </select>
      </div>

      <div className="space-y-4">
        {(() => {
          // Trier les analyses selon l'ordre choisi (par date d'envoi = createdAt)
          const sortedAnalyses = [...analyses].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
          });

          return sortedAnalyses.length > 0 ? (
            sortedAnalyses.map(renderAnalysisItem)
          ) : (
            <div className="text-center py-12 md:py-16 px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 font-bold mb-2">Aucune analyse disponible</p>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Vos analyses médicales apparaîtront ici une fois prescrites par votre médecin</p>
              {onNavigateToNewAppointment && (
                <button
                  onClick={onNavigateToNewAppointment}
                  className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 dark:from-secondary-400 dark:to-secondary-500 dark:hover:from-secondary-500 dark:hover:to-secondary-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 font-medium text-sm md:text-base shadow-lg hover:shadow-xl hover:scale-105"
                >
                  📅 Prendre rendez-vous
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}