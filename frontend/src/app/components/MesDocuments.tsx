// frontend/src/app/components/MesDocuments.tsx
'use client';

import React, { useState, useEffect } from 'react';
import documentService, { type Document, type DocumentsResponse, type DocumentStats } from '../../services/documentService';
import { useAuthStore } from '@/store/auth';

// Types de documents simplifiés par format de fichier
const DOCUMENT_TYPES = [
  { value: 'all', label: 'Tous les documents' },
  { value: 'pdf', label: 'Documents PDF' },
  { value: 'image', label: 'Images et Photos' },
  { value: 'word', label: 'Documents Word' },
  { value: 'excel', label: 'Tableaux Excel' },
  { value: 'other', label: 'Autres formats' },
];

export default function MesDocuments() {
  // États
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  // 🔒 NOUVEAUX ÉTATS POUR LA PRÉVISUALISATION SÉCURISÉE
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<'camera' | 'preview' | 'edit' | 'save'>('camera');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanFileName, setScanFileName] = useState('');
  const [scanDescription, setScanDescription] = useState('');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // 📐 ÉTATS POUR L'ÉDITION
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // 🔍 ÉTATS POUR ZOOM ET PAN
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // États pour l'upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const { user } = useAuthStore();

  // Forcer la grille sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // < sm breakpoint
        setViewMode('grid');
      }
    };

    handleResize(); // Exécuter au chargement
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fonctions utilitaires
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeFromMime = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'excel';
    return 'other';
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  // Charger les documents
  const loadDocuments = async (page = 1, type = selectedType, search = searchQuery) => {
    try {
      setLoading(true);
      setError(null);

      let response: DocumentsResponse;

      if (search.trim()) {
        response = await documentService.searchDocuments(search, page);
      } else {
        let filteredDocuments = await documentService.getMyDocuments(page, 10);

        if (type !== 'all') {
          const allDocs = filteredDocuments.documents.filter(doc =>
            getFileTypeFromMime(doc.fileType) === type
          );

          response = {
            ...filteredDocuments,
            documents: allDocs,
            pagination: {
              ...filteredDocuments.pagination,
              totalRecords: allDocs.length
            }
          };
        } else {
          response = filteredDocuments;
        }
      }

      setDocuments(response.documents);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalDocuments(response.pagination.totalRecords);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response: DocumentStats = await documentService.getDocumentStats();
      setStats(response.stats);
    } catch (err) {
    }
  };


  // 📐 FONCTION : Appliquer les modifications d'édition
  const applyImageEdits = async () => {
    return new Promise<void>((resolve) => {
      if (!editedImage || !canvasRef.current) {
        resolve();
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Dimensions de base
        let canvasWidth = img.width;
        let canvasHeight = img.height;

        // Ajuster pour la rotation
        if (rotation % 180 !== 0) {
          canvasWidth = img.height;
          canvasHeight = img.width;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Nettoyer le canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();

        // Centre du canvas
        ctx.translate(canvasWidth / 2, canvasHeight / 2);

        // Rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Zoom
        ctx.scale(zoomLevel, zoomLevel);

        // Pan (décalage)
        ctx.translate(panPosition.x / zoomLevel, panPosition.y / zoomLevel);

        // Filtres
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Dessiner l'image centrée
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

        ctx.restore();

        // Convertir en image finale
        const finalImage = canvas.toDataURL('image/jpeg', 0.95);

        setCapturedImage(finalImage);

        resolve();
      };

      img.onerror = () => {
        resolve();
      };

      img.src = editedImage;
    });
  };

  // Gestionnaires d'événements
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDocuments(1, selectedType, searchQuery);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
    setSearchQuery('');
    loadDocuments(1, type, '');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadDocuments(page, selectedType, searchQuery);
  };

  // Gestion du drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFile(file);
      setUploadTitle(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadTitle(file.name);
    }
  };

  // Upload du document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const fileType = getFileTypeFromMime(uploadFile.type);
      const recordType = 'document';

      await documentService.uploadDocument(
        uploadFile,
        recordType,
        uploadTitle || uploadFile.name,
        uploadDescription
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setShowUpload(false);

      loadDocuments(currentPage, selectedType, searchQuery);
      loadStats();

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Supprimer un document avec confirmation personnalisée
  const handleDeleteConfirm = async (documentId: string) => {
  try {
    await documentService.deleteDocument(documentId);

    // ✅ Fermer la modale de confirmation
    setShowDeleteConfirm(null);

    // ✅ Recharger les documents
    await loadDocuments(currentPage, selectedType, searchQuery);
    await loadStats();

  } catch (err: any) {
    // Si le document a été supprimé malgré l'erreur, on recharge quand même
    setShowDeleteConfirm(null);
    await loadDocuments(currentPage, selectedType, searchQuery);
    await loadStats();
  }
};

  // 🔒 PRÉVISUALISER UN DOCUMENT AVEC SÉCURITÉ JWT
  // Dans handlePreview
  const handlePreview = async (document: Document) => {
    setPreviewDocument(document);
    setLoadingPreview(true);

    try {
      const result = await documentService.previewDocument(document.id);

      // Si c'est un objet (PDF ou autre), pas d'URL
      if (typeof result === 'object') {
        setPreviewUrl(null);
      } else {
        // Si c'est une string (URL blob pour image)
        setPreviewUrl(result);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la prévisualisation');
    } finally {
      setLoadingPreview(false);
    }
  };
  // 🔒 FERMER LA PRÉVISUALISATION ET NETTOYER LES RESSOURCES
  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewDocument(null);
    setLoadingPreview(false);
  };

  // Télécharger un document
  const handleDownload = async (documentId: string) => {
    try {
      // Nettoyer les erreurs précédentes
      setError(null);
      await documentService.downloadDocument(documentId);
      // Le téléchargement a réussi - pas besoin de message de succès car le fichier se télécharge
    } catch (err: any) {
      // Afficher l'erreur seulement si c'est une vraie erreur
      const errorMessage = err.message || 'Erreur lors du téléchargement';
      setError(errorMessage);
      // Auto-effacer l'erreur après 5 secondes
      setTimeout(() => setError(null), 5000);
    }
  };

  // 📸 FONCTION 1 : Ouvrir la caméra
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setVideoStream(stream);

      // Attacher le stream à la vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  // 📸 FONCTION 2 : Capturer la photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);

    // Passer à l'étape prévisualisation
    setScanStep('preview');

    // Arrêter le stream vidéo
    stopCamera();
  };

  // 📸 FONCTION 3 : Arrêter la caméra
  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  // 📸 FONCTION 4 : Reprendre une photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setScanStep('camera');
    openCamera();
  };

  // 📸 FONCTION 5 : Convertir DataURL en File
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  // 📸 FONCTION 6 : Enregistrer le document scanné
  const saveScanDocument = async () => {
    if (!capturedImage) return;

    try {
      setUploading(true);

      // Convertir l'image en fichier
      const fileName = scanFileName || `scan-${Date.now()}.jpg`;
      const file = dataURLtoFile(capturedImage, fileName);

      // Upload via le service existant
      await documentService.uploadDocument(
        file,
        'document',
        fileName,
        scanDescription
      );

      // Réinitialiser et fermer
      closeScanModal();
      loadDocuments(currentPage, selectedType, searchQuery);
      loadStats();

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setUploading(false);
    }
  };

  // 📸 FONCTION 7 : Fermer la modale scan
  const closeScanModal = () => {
    stopCamera();
    setShowScanModal(false);
    setScanStep('camera');
    setCapturedImage(null);
    setScanFileName('');
    setScanDescription('');
  };

  // 📸 FONCTION 8 : Ouvrir la modale scan
  const openScanModal = () => {
    setShowScanModal(true);
    setScanStep('camera');
    openCamera();
  };

  // Effets
  useEffect(() => {
    if (user) {
      loadDocuments();
      loadStats();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-xl">Vous devez être connecté pour voir vos documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Début Section : Header Documents */}
      <div className="bg-theme-card theme-transition rounded-xl shadow-theme-sm p-6 border border-theme">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-theme-primary theme-transition mb-2 sm:mb-3">Mes Documents</h1>
            <p className="text-base sm:text-xl text-theme-secondary theme-transition">
              Gérez vos documents médicaux en toute sécurité
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-[#006D65] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-center">
              <div className="font-bold text-xl sm:text-2xl">{totalDocuments}</div>
              <div className="text-sm sm:text-lg opacity-90">Documents</div>
            </div>

            {/* 📸 NOUVEAU BOUTON SCANNER */}
            <button
              onClick={openScanModal}
              className="bg-[#006D65] hover:bg-[#005a54] text-white px-4 py-2 sm:px-8 sm:py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-xl"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Scanner un document</span>
              <span className="sm:hidden">Scanner</span>
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="bg-[#E6A930] hover:bg-[#d4941a] text-white px-4 py-2 sm:px-8 sm:py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-xl"
            >
              <span className="hidden sm:inline">Ajouter un document</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
      </div>
      {/* Fin Section : Header Documents */}

      {/* Début Section : Filtres et Recherche */}
      <div className="bg-theme-card theme-transition rounded-xl shadow-theme-sm p-4 sm:p-6 border border-theme">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-2xl font-semibold text-theme-primary theme-transition mb-3 sm:mb-4">Filtrer par type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {DOCUMENT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`
                  p-3 sm:p-5 rounded-lg border-2 transition-all duration-200 text-center
                  ${selectedType === type.value
                    ? 'border-[#006D65] bg-[#006D65] text-white'
                    : 'border-gray-200 dark:border-gray-600 hover:border-[#006D65] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200'
                  }
                `}
              >
                <div className="font-medium text-sm sm:text-xl">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans mes documents..."
              className="w-full px-4 py-3 pr-12 sm:px-6 sm:py-4 sm:pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] text-base sm:text-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
            />
            <button
              type="submit"
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-[#006D65]"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                loadDocuments(1, selectedType, '');
              }}
              className="px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-xl whitespace-nowrap dark:text-gray-200 transition-colors duration-300"
            >
              Effacer
            </button>
          )}
        </form>
      </div>
      {/* Fin Section : Filtres et Recherche */}

      {/* Début Section : Modal Upload */}
      {showUpload && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Ajouter un document</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleUpload} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors
                  ${dragActive
                    ? 'border-[#006D65] bg-[#006D65]/5'
                    : 'border-gray-300 hover:border-[#006D65]'
                  }
                `}
              >
                {uploadFile ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-4xl sm:text-6xl">{getFileExtension(uploadFile.name)}</div>
                    <div>
                      <p className="text-lg sm:text-2xl font-medium text-gray-900">{uploadFile.name}</p>
                      <p className="text-gray-600 text-base sm:text-xl">{formatFileSize(uploadFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="text-red-600 hover:text-red-700 text-base sm:text-xl"
                    >
                      Supprimer le fichier
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-4xl sm:text-6xl">📎</div>
                    <div>
                      <p className="text-lg sm:text-2xl font-medium text-gray-900">
                        Glissez votre fichier ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-gray-600 text-base sm:text-xl">PDF, images, Word, Excel (max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block bg-[#006D65] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-[#005a54] transition-colors cursor-pointer text-base sm:text-xl"
                    >
                      Sélectionner un fichier
                    </label>
                  </div>
                )}
              </div>

              {uploadFile && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-base sm:text-xl font-medium text-gray-700 mb-2 sm:mb-3">
                      Titre du document
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] text-base sm:text-xl"
                      placeholder="Titre descriptif..."
                    />
                  </div>

                  <div>
                    <label className="block text-base sm:text-xl font-medium text-gray-700 mb-2 sm:mb-3">
                      Description (optionnelle)
                    </label>
                    <textarea
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] text-base sm:text-xl resize-none"
                      placeholder="Informations complémentaires..."
                    />
                  </div>

                  {uploading && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-base sm:text-xl">
                        <span>Upload en cours...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                        <div
                          className="bg-[#006D65] h-3 sm:h-4 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <button
                      type="submit"
                      disabled={uploading || !uploadFile}
                      className="flex-1 bg-[#E6A930] text-white py-3 px-6 sm:py-4 sm:px-8 rounded-lg hover:bg-[#d4941a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-xl"
                    >
                      {uploading ? 'Upload en cours...' : 'Enregistrer le document'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpload(false)}
                      disabled={uploading}
                      className="px-6 py-3 sm:px-8 sm:py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-base sm:text-xl"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Fin Section : Modal Upload */}

      {/* Début Section : Modal Confirmation Suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="text-5xl sm:text-6xl text-red-500">⚠</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Confirmer la suppression</h3>
              <p className="text-base sm:text-lg text-gray-600">
                Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-base sm:text-lg"
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base sm:text-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fin Section : Modal Confirmation Suppression */}

      {/* 📸 DÉBUT SECTION : MODALE SCAN DE DOCUMENT */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">📸 Scanner un document</h2>
                <button
                  onClick={closeScanModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-8">
              {/* Canvas caché - disponible pour TOUTES les étapes */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

             
{/* ÉTAPE 1 : CAMÉRA - VERSION AMÉLIORÉE AVEC GRANDE ZONE */}
              {scanStep === 'camera' && (
                <div className="space-y-3 sm:space-y-6">
                  <div className="text-center">
                    <p className="text-sm sm:text-2xl text-gray-700 mb-2 sm:mb-4">
                      Positionnez votre document devant la caméra
                    </p>
                  </div>

                  {/* Vidéo en direct - ZONE AGRANDIE POUR MEILLEUR CADRAGE */}
                  <div 
                    className="relative rounded-lg overflow-hidden" 
                    style={{ 
                      aspectRatio: '3/4', // Format portrait pour documents
                      minHeight: '400px', // Zone plus grande pour bien voir
                      maxHeight: '55vh', // Descend bien vers le bas sans déborder
                      width: '100%'
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay guide - SEULEMENT LE CADRE */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 sm:border-4 border-[#E6A930] border-dashed rounded-lg w-[85%] sm:w-[90%] h-[80%] sm:h-[85%]"></div>
                    </div>
                  </div>

                  {/* Bouton Capturer - COMPACT */}
                  <div className="flex justify-center pt-2 sm:pt-4">
                    <button
                      onClick={capturePhoto}
                      disabled={!videoStream}
                      className="bg-[#E6A930] hover:bg-[#d4941a] text-white px-6 py-2.5 sm:px-12 sm:py-5 rounded-full font-bold text-base sm:text-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      📷 Capturer
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={closeScanModal}
                      className="text-gray-600 hover:text-gray-800 text-sm sm:text-xl underline"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : PRÉVISUALISATION - VERSION OPTIMISÉE */}
              {scanStep === 'preview' && capturedImage && (
                <div className="space-y-3 sm:space-y-6">
                  <div className="text-center">
                    <p className="text-base sm:text-2xl text-gray-700 mb-2 sm:mb-6">
                      Vérifiez votre capture
                    </p>
                  </div>

                  {/* Image capturée - MÊME TAILLE QUE LA CAMÉRA */}
                  <div className="bg-gray-100 rounded-lg p-2 sm:p-4">
                    <div 
                      className="mx-auto overflow-hidden rounded-lg shadow-lg"
                      style={{
                        maxHeight: '55vh', // Même hauteur que la zone caméra
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={capturedImage}
                        alt="Document capturé"
                        className="max-w-full h-auto"
                        style={{
                          maxHeight: '55vh',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>

                  {/* Boutons - COMPACTS */}
                  <div className="flex gap-2 sm:gap-4 justify-center pt-2 sm:pt-4">
                    <button
                      onClick={retakePhoto}
                      className="px-4 py-2 sm:px-8 sm:py-4 border-2 border-[#006D65] text-[#006D65] rounded-lg hover:bg-[#006D65] hover:text-white transition-colors text-sm sm:text-xl font-medium"
                    >
                      🔄 Reprendre
                    </button>
                    <button
                      onClick={() => {
                        setEditedImage(capturedImage);
                        setScanStep('edit');
                      }}
                      className="bg-[#E6A930] hover:bg-[#d4941a] text-white px-4 py-2 sm:px-8 sm:py-4 rounded-lg transition-colors text-sm sm:text-xl font-medium"
                    >
                      ✏️ Éditer
                    </button>
                  </div>
                </div>
              )}

                 {/* ÉTAPE 2.5 : ÉDITION AVEC ZOOM - VERSION OPTIMISÉE MOBILE */}
              {scanStep === 'edit' && editedImage && (
                <div className="space-y-2 sm:space-y-6">
                  <div className="text-center">
                    <p className="text-sm sm:text-2xl text-gray-700 mb-1 sm:mb-6">
                      Ajustez votre document
                    </p>
                  </div>

                  {/* Image avec zoom et pan - HAUTEUR RÉDUITE POUR MOBILE */}
                  <div className="bg-gray-100 rounded-lg p-1 sm:p-4 overflow-hidden">
                    <div
                      className="flex justify-center relative cursor-move"
                      style={{
                        width: '100%',
                        height: '160px', // Réduit de 200px à 160px pour mobile
                        maxHeight: '20vh', // Réduit de 35vh à 20vh
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                      onMouseDown={(e) => {
                        if (zoomLevel > 1) {
                          setIsPanning(true);
                          setPanStart({
                            x: e.clientX - panPosition.x,
                            y: e.clientY - panPosition.y
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (isPanning && zoomLevel > 1) {
                          setPanPosition({
                            x: e.clientX - panStart.x,
                            y: e.clientY - panStart.y
                          });
                        }
                      }}
                      onMouseUp={() => setIsPanning(false)}
                      onMouseLeave={() => setIsPanning(false)}
                      // Support tactile pour mobile
                      onTouchStart={(e) => {
                        if (zoomLevel > 1 && e.touches.length === 1) {
                          setIsPanning(true);
                          setPanStart({
                            x: e.touches[0].clientX - panPosition.x,
                            y: e.touches[0].clientY - panPosition.y
                          });
                        }
                      }}
                      onTouchMove={(e) => {
                        if (isPanning && zoomLevel > 1 && e.touches.length === 1) {
                          setPanPosition({
                            x: e.touches[0].clientX - panStart.x,
                            y: e.touches[0].clientY - panStart.y
                          });
                        }
                      }}
                      onTouchEnd={() => setIsPanning(false)}
                    >
                      <img
                        src={editedImage}
                        alt="Document en édition"
                        className="transition-all duration-300"
                        style={{
                          transform: `rotate(${rotation}deg) scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        draggable={false}
                      />

                      {/* Indicateur de zoom */}
                      {zoomLevel > 1 && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs sm:text-base">
                          {Math.round(zoomLevel * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contrôles d'édition - ESPACEMENT RÉDUIT POUR MOBILE */}
                  <div className="space-y-2 sm:space-y-4 bg-white p-2 sm:p-6 rounded-lg border border-gray-200">

                    {/* Contrôle Zoom - INTERFACE COMPACTE */}
                    <div>
                      <label className="block text-xs sm:text-lg font-medium text-gray-700 mb-1">
                        🔍 Zoom: {Math.round(zoomLevel * 100)}%
                      </label>
                      <div className="flex items-center gap-1 sm:gap-4">
                        <button
                          onClick={() => {
                            const newZoom = Math.max(0.5, zoomLevel - 0.25);
                            setZoomLevel(newZoom);
                            if (newZoom === 1) {
                              setPanPosition({ x: 0, y: 0 });
                            }
                          }}
                          className="px-2 py-1 sm:px-6 sm:py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg sm:text-2xl font-bold transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          value={zoomLevel * 100}
                          onChange={(e) => {
                            const newZoom = Number(e.target.value) / 100;
                            setZoomLevel(newZoom);
                            if (newZoom === 1) {
                              setPanPosition({ x: 0, y: 0 });
                            }
                          }}
                          className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <button
                          onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                          className="px-2 py-1 sm:px-6 sm:py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg sm:text-2xl font-bold transition-colors"
                        >
                          +
                        </button>
                        {zoomLevel !== 1 && (
                          <button
                            onClick={() => {
                              setZoomLevel(1);
                              setPanPosition({ x: 0, y: 0 });
                            }}
                            className="px-1 sm:px-4 py-1 sm:py-3 text-red-600 hover:text-red-700 text-[9px] sm:text-lg underline whitespace-nowrap"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      {zoomLevel > 1 && (
                        <p className="text-[9px] sm:text-sm text-gray-600 mt-1">
                          💡 {window.innerWidth < 640 ? 'Glissez pour déplacer' : 'Glissez pour déplacer'}
                        </p>
                      )}
                    </div>

                    {/* Rotation - INTERFACE COMPACTE */}
                    <div>
                      <label className="block text-xs sm:text-lg font-medium text-gray-700 mb-1">
                        🔄 Rotation
                      </label>
                      <div className="flex items-center gap-1 sm:gap-4">
                        <button
                          onClick={() => setRotation(prev => prev - 90)}
                          className="flex-1 px-2 py-1 sm:px-6 sm:py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] sm:text-lg font-medium transition-colors"
                        >
                          ↶ -90°
                        </button>
                        <span className="text-xs sm:text-xl font-bold text-[#006D65] min-w-[35px] sm:min-w-[80px] text-center">
                          {rotation}°
                        </span>
                        <button
                          onClick={() => setRotation(prev => prev + 90)}
                          className="flex-1 px-2 py-1 sm:px-6 sm:py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] sm:text-lg font-medium transition-colors"
                        >
                          ↷ +90°
                        </button>
                        {rotation !== 0 && (
                          <button
                            onClick={() => setRotation(0)}
                            className="px-1 sm:px-4 py-1 sm:py-3 text-red-600 hover:text-red-700 text-[9px] sm:text-lg underline whitespace-nowrap"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Luminosité - SLIDER COMPACT */}
                    <div>
                      <label className="block text-xs sm:text-lg font-medium text-gray-700 mb-1">
                        ☀️ Luminosité: {brightness}%
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        {brightness !== 100 && (
                          <button
                            onClick={() => setBrightness(100)}
                            className="text-red-600 hover:text-red-700 text-[9px] sm:text-sm underline whitespace-nowrap"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contraste - SLIDER COMPACT */}
                    <div>
                      <label className="block text-xs sm:text-lg font-medium text-gray-700 mb-1">
                        🎨 Contraste: {contrast}%
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        {contrast !== 100 && (
                          <button
                            onClick={() => setContrast(100)}
                            className="text-red-600 hover:text-red-700 text-[9px] sm:text-sm underline whitespace-nowrap"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bouton réinitialisation globale */}
                    {(brightness !== 100 || contrast !== 100 || rotation !== 0 || zoomLevel !== 1) && (
                      <button
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setRotation(0);
                          setZoomLevel(1);
                          setPanPosition({ x: 0, y: 0 });
                        }}
                        className="w-full px-2 py-1.5 sm:px-6 sm:py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs sm:text-lg font-medium"
                      >
                        🔄 Réinitialiser tous les réglages
                      </button>
                    )}
                  </div>

                  {/* Boutons navigation - TAILLE RÉDUITE MOBILE */}
                  <div className="flex gap-2 sm:gap-4 justify-center pt-2 sm:pt-4">
                    <button
                      onClick={() => {
                        setScanStep('preview');
                        setRotation(0);
                        setBrightness(100);
                        setContrast(100);
                        setZoomLevel(1);
                        setPanPosition({ x: 0, y: 0 });
                      }}
                      className="px-3 py-2 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-xl font-medium"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={async () => {
                        await applyImageEdits();
                        await new Promise(resolve => setTimeout(resolve, 100));
                        setScanStep('save');
                      }}
                      className="bg-[#E6A930] hover:bg-[#d4941a] text-white px-4 py-2 sm:px-8 sm:py-4 rounded-lg transition-colors text-sm sm:text-xl font-medium"
                    >
                      ✅ Terminer
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : ENREGISTREMENT */}
              {scanStep === 'save' && capturedImage && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-lg sm:text-2xl text-gray-700">
                      Nommez votre document scanné
                    </p>
                  </div>

                  {/* Aperçu miniature */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <img
                      src={capturedImage}
                      alt="Aperçu"
                      className="max-w-xs rounded-lg shadow-md border-2 border-gray-200"
                    />
                  </div>

                  {/* Formulaire */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-base sm:text-xl font-medium text-gray-700 mb-2 sm:mb-3">
                        Nom du document *
                      </label>
                      <input
                        type="text"
                        value={scanFileName}
                        onChange={(e) => setScanFileName(e.target.value)}
                        placeholder="Ex: Ordonnance Dr Kouassi"
                        className="w-full px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] text-base sm:text-xl"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-base sm:text-xl font-medium text-gray-700 mb-2 sm:mb-3">
                        Description (optionnelle)
                      </label>
                      <textarea
                        value={scanDescription}
                        onChange={(e) => setScanDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] text-base sm:text-xl resize-none"
                        placeholder="Informations complémentaires..."
                      />
                    </div>

                    {/* Barre de progression si upload en cours */}
                    {uploading && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-base sm:text-xl">
                          <span>Enregistrement en cours...</span>
                          <span className="font-bold text-[#006D65]">⏳</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                          <div className="bg-[#006D65] h-3 sm:h-4 rounded-full transition-all duration-300 animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
                      <button
                        type="button"
                        onClick={() => setScanStep('preview')}
                        disabled={uploading}
                        className="px-6 py-3 sm:px-8 sm:py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-base sm:text-xl"
                      >
                        ← Retour
                      </button>
                      <button
                        type="button"
                        onClick={saveScanDocument}
                        disabled={uploading || !scanFileName.trim()}
                        className="flex-1 bg-[#E6A930] text-white py-3 px-6 sm:py-4 sm:px-8 rounded-lg hover:bg-[#d4941a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-xl"
                      >
                        {uploading ? '💾 Enregistrement...' : '💾 Enregistrer le document'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 📸 FIN SECTION : MODALE SCAN DE DOCUMENT */}

      {/* Début Section : Modal Prévisualisation SÉCURISÉE */}
      {previewDocument && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col transition-colors duration-300">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{previewDocument.title}</h2>
              <button
                onClick={() => closePreview()}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl ml-2 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="p-4 sm:p-6">
              <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-4 sm:p-8 transition-colors duration-300">
                {loadingPreview ? (
                  <div className="flex items-center justify-center py-12 sm:py-16">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[#006D65]"></div>
                    <span className="ml-4 text-base sm:text-xl text-gray-600 dark:text-gray-300">Chargement de la prévisualisation...</span>
                  </div>
                ) : previewDocument.fileType.includes('image') ? (
                  <div className="text-center">
                    <img
                      src={previewUrl || ''}
                      alt={previewDocument.title}
                      className="max-w-full max-h-[60vh] sm:max-h-[70vh] mx-auto rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center py-12">
                      <div className="text-5xl sm:text-6xl text-gray-400 mb-4">🖼️</div>
                      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">Impossible de charger l'image</p>
                      <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-2">Le fichier peut être corrompu ou inaccessible</p>
                    </div>
                  </div>
                ) : previewDocument.fileType.includes('pdf') ? (
                  <div className="text-center space-y-4 sm:space-y-6">
                    {previewUrl ? (
                      // Prévisualisation PDF avec iframe
                      <iframe
                        src={previewUrl}
                        className="w-full h-[60vh] sm:h-[70vh] border rounded-lg"
                        title={previewDocument.title}
                        style={{ minHeight: '400px' }}
                      />
                    ) : (
                      // Fallback si pas d'URL
                      <div className="space-y-3 sm:space-y-4">
                        <div className="text-6xl sm:text-8xl text-[#006D65]">📄</div>
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Document PDF</h3>
                          <p className="text-base sm:text-xl text-gray-600">{previewDocument.fileName}</p>
                          <p className="text-base sm:text-lg text-gray-600">
                            Chargement de la prévisualisation PDF...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="text-6xl sm:text-8xl text-[#006D65]">{getFileExtension(previewDocument.fileName)}</div>
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{previewDocument.title}</h3>
                      <p className="text-base sm:text-xl text-gray-600">{previewDocument.fileName}</p>
                      <p className="text-base sm:text-lg text-gray-600">
                        Ce type de fichier ne peut pas être prévisualisé. Téléchargez-le pour l'ouvrir.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">Informations</h4>
                      <div className="space-y-1 sm:space-y-2 text-sm sm:text-lg">
                        <p><span className="text-gray-600">Nom:</span> <span className="font-medium">{previewDocument.fileName}</span></p>
                        <p><span className="text-gray-600">Taille:</span> <span className="font-medium">{formatFileSize(previewDocument.fileSize)}</span></p>
                        <p><span className="text-gray-600">Type:</span> <span className="font-medium">{previewDocument.fileType}</span></p>
                        <p><span className="text-gray-600">Ajouté le:</span> <span className="font-medium">{new Date(previewDocument.recordDate).toLocaleDateString('fr-FR')}</span></p>
                      </div>
                    </div>

                    {previewDocument.content && (
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">Description</h4>
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                          <p className="text-sm sm:text-lg text-gray-700 leading-relaxed">{previewDocument.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 justify-center pt-6 sm:pt-8 border-t border-gray-200 mt-4 sm:mt-6">
                  <button
                    onClick={() => handleDownload(previewDocument.id)}
                    className="bg-[#006D65] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-[#005a54] transition-colors text-base sm:text-xl font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger
                  </button>
                  <button
                    onClick={() => closePreview()}
                    className="px-6 py-3 sm:px-8 sm:py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base sm:text-xl"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fin Section : Modal Prévisualisation */}

      {/* Début Section : Liste des Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 m-4 sm:m-6 rounded">
            <p className="font-medium text-base sm:text-lg">Erreur</p>
            <p className="text-base sm:text-xl">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[#006D65]"></div>
            <span className="ml-4 text-base sm:text-xl text-gray-600">Chargement...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">📄</div>
            <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">Aucun document trouvé</h3>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-xl mb-6 sm:mb-8">
              {searchQuery ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter votre premier document'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-[#E6A930] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-[#d4941a] transition-colors text-base sm:text-xl"
            >
              Ajouter un document
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {documents.length} document{documents.length > 1 ? 's' : ''} trouvé{documents.length > 1 ? 's' : ''}
              </h3>
              <div className="flex items-center gap-3 sm:gap-4">
                {selectedType !== 'all' && (
                  <span className="bg-[#006D65] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-lg">
                    {DOCUMENT_TYPES.find(t => t.value === selectedType)?.label}
                  </span>
                )}
                {/* Boutons Grille/Liste : cachés sur mobile, visibles sur tablette+ */}
                <div className="hidden sm:flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-6 py-3 text-xl font-medium transition-colors ${viewMode === 'grid'
                      ? 'bg-[#E6A930] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Grille
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-6 py-3 text-xl font-medium transition-colors ${viewMode === 'list'
                      ? 'bg-[#E6A930] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Liste
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 hover:border-[#006D65] bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800/80"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="text-2xl sm:text-3xl">{getFileExtension(document.fileName)}</div>
                      <span className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 sm:px-3 sm:py-1 rounded">
                        {getFileTypeFromMime(document.fileType).toUpperCase()}
                      </span>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-xl mb-2 sm:mb-3 line-clamp-2">
                        {document.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-lg mb-2 sm:mb-3">{document.fileName}</p>
                      <div className="flex justify-between text-sm sm:text-lg text-gray-500">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>
                          {new Date(document.recordDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {document.content && (
                      <p className="text-gray-600 text-sm sm:text-lg mb-4 sm:mb-6 line-clamp-2">
                        {document.content}
                      </p>
                    )}

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handlePreview(document)}
                        className="flex-1 bg-[#006D65] text-white py-2 px-3 sm:py-3 sm:px-4 rounded-lg hover:bg-[#005a54] transition-colors text-sm sm:text-lg font-medium"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="px-3 py-2 sm:px-4 sm:py-3 border border-[#006D65] text-[#006D65] rounded-lg hover:bg-[#006D65] hover:text-white transition-colors text-sm sm:text-lg"
                        title="Télécharger"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(document.id)}
                        className="px-3 py-2 sm:px-4 sm:py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-lg"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-[#006D65]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
                        <div className="text-xl sm:text-2xl flex-shrink-0">{getFileExtension(document.fileName)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base sm:text-xl mb-1 truncate">{document.title}</h4>
                          <p className="text-gray-600 text-sm sm:text-lg truncate">{document.fileName}</p>
                        </div>
                        <div className="text-sm sm:text-lg text-gray-500 hidden md:block flex-shrink-0">
                          {formatFileSize(document.fileSize)}
                        </div>
                        <div className="text-sm sm:text-lg text-gray-500 hidden lg:block flex-shrink-0">
                          {new Date(document.recordDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 ml-3 sm:ml-6 flex-shrink-0">
                        <button
                          onClick={() => handlePreview(document)}
                          className="bg-[#006D65] text-white px-3 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-[#005a54] transition-colors text-sm sm:text-lg whitespace-nowrap"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleDownload(document.id)}
                          className="px-2 py-2 sm:px-4 sm:py-2 border border-[#006D65] text-[#006D65] rounded-lg hover:bg-[#006D65] hover:text-white transition-colors text-sm sm:text-lg"
                          title="Télécharger"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(document.id)}
                          className="px-2 py-2 sm:px-4 sm:py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-lg"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-8 sm:mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-xl"
                >
                  ← Précédent
                </button>



                <div className="flex space-x-1 sm:space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg text-sm sm:text-xl ${currentPage === pageNumber
                          ? 'bg-[#006D65] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-xl"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Fin Section : Liste des Documents */}
    </div>
  );
}