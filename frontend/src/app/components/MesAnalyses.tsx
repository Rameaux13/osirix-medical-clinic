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
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

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
      console.error('Erreur chargement analyses:', error);
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
      console.error('Erreur téléchargement:', error);
      alert('Impossible de télécharger les résultats');
    }
  };

  // Rendu d'une analyse
  const renderAnalysisItem = (analysis: LabOrder) => (
    <div key={analysis.id} className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-center mb-3 min-w-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-[#006D65] rounded-full flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 text-base md:text-xl break-words">{analysis.examType}</h4>
                <p className="text-sm md:text-base text-gray-600">
                  Prescrit le {analysesService.formatDate(analysis.orderDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Médecin */}
          {analysis.doctor && (
            <div className="flex items-center space-x-3 mb-4 bg-gray-100 rounded-lg p-3 min-w-0">
              <div className="w-8 h-8 bg-[#006D65] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                  {analysesService.formatDoctorName(analysis.doctor)}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Médecin prescripteur</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {analysis.instructions && (
            <div className="mb-4">
              <p className="text-xs md:text-sm text-gray-600 mb-2 font-medium">Instructions :</p>
              <div className="text-sm md:text-base text-gray-800 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-200 break-words overflow-wrap-anywhere">
                {analysis.instructions}
              </div>
            </div>
          )}

          {/* FICHIERS JOINTS */}
          {analysis.resultFiles && Array.isArray(analysis.resultFiles) && analysis.resultFiles.length > 0 && (
            <div className="mb-4 min-w-0">
              <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">Fichiers joints ({analysis.resultFiles.length}) :</p>
              <div className="space-y-2">
                {analysis.resultFiles.map((filePath: any, index: number) => {
                  // Si c'est un string direct, utiliser directement
                  const fileUrl = typeof filePath === 'string' ? filePath : filePath.url;
                  const fileName = typeof filePath === 'string'
                    ? filePath.split('/').pop() || `Document ${index + 1}`
                    : filePath.name || `Document ${index + 1}`;
                  const fileType = typeof filePath === 'string'
                    ? (filePath.endsWith('.pdf') ? 'PDF' : 'Image')
                    : filePath.type || 'Fichier médical';

                  return (
                    <a
                      key={index}
                      href={`http://localhost:3001${fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 md:gap-3 bg-purple-50 rounded-lg p-3 border border-purple-200 hover:bg-purple-100 transition-colors group min-w-0"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-700 transition-colors flex-shrink-0">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs md:text-sm font-medium text-purple-900 truncate break-all">{fileName}</p>
                        <p className="text-xs text-purple-600">{fileType}</p>
                      </div>
                      <Download className="w-4 h-4 md:w-5 md:h-5 text-purple-600 group-hover:text-purple-800 flex-shrink-0" />
                    </a>
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Mes Analyses Médicales</h2>
        <Stethoscope className="w-6 h-6 text-[#006D65]" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="bg-gradient-to-r from-[#006D65]/5 via-gray-50 to-[#E6A930]/5 rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#006D65]">{stats.total}</p>
              <p className="text-sm md:text-base text-gray-600 font-medium mt-2">Total analyses</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <label htmlFor="sortOrder" className="text-sm md:text-base text-gray-700 font-medium">
          Trier par :
        </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:border-[#006D65] focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors"
        >
          <option value="recent">Du plus récent au moins récent</option>
          <option value="oldest">Du moins récent au plus récent</option>
        </select>
      </div>

      <div className="space-y-4">
        {(() => {
          // Trier les analyses selon l'ordre choisi
          const sortedAnalyses = [...analyses].sort((a, b) => {
            const dateA = new Date(a.orderDate).getTime();
            const dateB = new Date(b.orderDate).getTime();
            return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
          });

          return sortedAnalyses.length > 0 ? (
            sortedAnalyses.map(renderAnalysisItem)
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-lg md:text-xl text-gray-600 mb-2">Aucune analyse disponible</p>
              <p className="text-sm md:text-base text-gray-500 mb-6">Vos analyses médicales apparaîtront ici une fois prescrites</p>
              {onNavigateToNewAppointment && (
                <button
                  onClick={onNavigateToNewAppointment}
                  className="bg-[#E6A930] text-white px-6 py-3 rounded-lg hover:bg-[#d49821] transition-colors font-medium text-sm md:text-base"
                >
                  Prendre rendez-vous
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}