'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Calendar, FileText, Upload, X, CheckCircle, Loader, Camera } from 'lucide-react';
import { secretaryService, type Patient } from '@/services/secretaryService';

// ==================== INTERFACES ====================
interface EnvoyerAnalyseFormProps {
  preselectedPatientId?: string;
  onSuccess?: () => void;
}

// ==================== CONSTANTES ====================
const EXAM_TYPES = [
  { value: 'PRISE_DE_SANG', label: 'Prise de sang' },
  { value: 'RADIO', label: 'Radiographie' },
  { value: 'SCANNER', label: 'Scanner' },
  { value: 'IRM', label: 'IRM' },
  { value: 'ECHOGRAPHIE', label: 'Échographie' },
  { value: 'ECG', label: 'ECG' },
  { value: 'AUTRES', label: 'Autres' },
];

// ==================== COMPOSANT PRINCIPAL ====================
const EnvoyerAnalyseForm = ({ preselectedPatientId, onSuccess }: EnvoyerAnalyseFormProps) => {
  
  // ========== ÉTATS DE BASE ==========
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [formData, setFormData] = useState({
    userId: preselectedPatientId || '',
    examType: '',
    orderDate: new Date().toISOString().split('T')[0],
    instructions: '',
    results: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // ========== ÉTATS DU SCANNER ==========
  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState<'camera' | 'preview' | 'edit' | 'save'>('camera');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  // ========== ÉTATS D'ÉDITION D'IMAGE ==========
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // ========== RÉFÉRENCES DOM ==========
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==================== EFFETS (USEEFFECT) ====================

  // Charger tous les patients au démarrage
  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const data = await secretaryService.getPatientsList('');
        setAllPatients(data);
      } catch (error) {
        // Gestion silencieuse
      }
    };
    fetchAllPatients();
  }, []);

  // Charger les patients pour l'autocomplete (recherche dynamique)
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await secretaryService.getPatientsList(searchPatient);
        setPatients(data);
      } catch (error) {
        // Gestion silencieuse
      }
    };

    if (searchPatient.length >= 2) {
      fetchPatients();
    } else {
      setPatients([]);
    }
  }, [searchPatient]);

  // Pré-remplir le patient si ID fourni dans l'URL
  useEffect(() => {
    if (preselectedPatientId && allPatients.length > 0) {
      const selectedPatient = allPatients.find(p => String(p.id) === String(preselectedPatientId));

      if (selectedPatient) {
        setSearchPatient(`${selectedPatient.firstName} ${selectedPatient.lastName}`);
        setFormData(prev => ({ ...prev, userId: selectedPatient.id }));
      }
    }
  }, [preselectedPatientId, allPatients]);

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS - PATIENTS ====================

  const handleSelectPatient = (patient: Patient) => {
    setFormData({ ...formData, userId: patient.id });
    setSearchPatient(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS - DRAG & DROP ====================

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      await uploadFiles(droppedFiles);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      await uploadFiles(selectedFiles);
    }
  };

  // ==================== UPLOAD DE FICHIERS ====================

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploadingFile(true);
    setError('');

    try {
      for (const file of filesToUpload) {
        // Validation taille max 10MB
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Le fichier ${file.name} dépasse 10MB`);
        }

        // Upload vers le backend
        const { path } = await secretaryService.uploadLabResultFile(file);

        // Ajouter aux listes
        setFiles(prev => [...prev, file]);
        setUploadedPaths(prev => [...prev, path]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setUploadedPaths(uploadedPaths.filter((_, i) => i !== index));
  };

  // ==================== FONCTIONS DU SCANNER - CAMÉRA ====================

  // Ouvrir la caméra
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra');
    }
  };

  // Capturer une photo depuis la caméra
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Dimensionner le canvas selon la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    setEditedImage(imageDataUrl);
    
    // Passer à l'étape preview
    setScanStep('preview');
    stopCamera();
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  // ==================== FONCTIONS DU SCANNER - ÉDITION ====================

  // Appliquer les modifications d'édition (rotation, zoom, luminosité, etc.)
  const applyImageEdits = (): Promise<void> => {
    return new Promise((resolve) => {
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
        // Calculer dimensions selon rotation
        let canvasWidth = img.width;
        let canvasHeight = img.height;

        if (rotation % 180 !== 0) {
          canvasWidth = img.height;
          canvasHeight = img.width;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Nettoyer et préparer
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();

        // Centrer
        ctx.translate(canvasWidth / 2, canvasHeight / 2);

        // Appliquer rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Appliquer zoom
        ctx.scale(zoomLevel, zoomLevel);

        // Appliquer pan (décalage)
        ctx.translate(panPosition.x / zoomLevel, panPosition.y / zoomLevel);

        // Appliquer filtres
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Dessiner l'image
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

  // Convertir une DataURL en File
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

  // Enregistrer le scan (ajouter à la liste des fichiers)
  const saveScan = async () => {
    if (!capturedImage) return;

    const fileName = `scan-${Date.now()}.jpg`;
    const file = dataURLtoFile(capturedImage, fileName);
    
    await uploadFiles([file]);
    closeScanner();
  };

  // Fermer le scanner et réinitialiser
  const closeScanner = () => {
    stopCamera();
    setShowScanner(false);
    setScanStep('camera');
    setCapturedImage(null);
    setEditedImage(null);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // ==================== SOUMISSION DU FORMULAIRE ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.userId) {
      setError('Veuillez sélectionner un patient');
      return;
    }

    if (!formData.examType) {
      setError('Veuillez sélectionner un type d\'analyse');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Envoi via le service
      await secretaryService.sendLabOrder({
        userId: formData.userId,
        examType: formData.examType,
        orderDate: formData.orderDate,
        instructions: formData.instructions,
        results: formData.results,
        resultFiles: uploadedPaths,
      });

      setSuccess(true);

      // Réinitialiser après 2 secondes
      setTimeout(() => {
        setFormData({
          userId: '',
          examType: '',
          orderDate: new Date().toISOString().split('T')[0],
          instructions: '',
          results: '',
        });
        setSearchPatient('');
        setFiles([]);
        setUploadedPaths([]);
        setSuccess(false);
        onSuccess?.();
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDU - SUCCÈS ====================

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-12 sm:p-16 text-center shadow-lg">
        <CheckCircle className="mx-auto text-green-500 mb-6" size={80} />
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Analyse envoyée !</h3>
        <p className="text-lg sm:text-xl text-gray-600">Le patient recevra une notification.</p>
      </div>
    );
  }

  // ==================== RENDU PRINCIPAL ====================

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg space-y-6 sm:space-y-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
          Envoyer une analyse
        </h2>

        {/* ========== SECTION PATIENT ========== */}
        <div className="relative">
          <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
            <User className="inline mr-2" size={20} />
            Patient *
          </label>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={searchPatient}
              onChange={(e) => {
                setSearchPatient(e.target.value);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
              placeholder="Rechercher un patient..."
              className="flex-1 border-2 border-gray-300 rounded-xl px-5 py-4 text-base sm:text-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
              required
            />
            
            {/* Bouton Tous / Fermer */}
            <button
              type="button"
              onClick={() => {
                if (showPatientDropdown && patients.length > 0) {
                  setShowPatientDropdown(false);
                } else {
                  setPatients(allPatients);
                  setShowPatientDropdown(true);
                }
              }}
              className="px-6 py-4 bg-[#006D65] hover:bg-[#004d47] text-white rounded-xl font-semibold text-base sm:text-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <User size={20} />
              {showPatientDropdown && patients.length > 0 ? 'Fermer' : 'Tous'}
            </button>
          </div>

          {/* Dropdown patients */}
          {showPatientDropdown && patients.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-semibold text-gray-900 text-base sm:text-lg">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm sm:text-base text-gray-500 mt-1">{patient.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========== TYPE D'ANALYSE ========== */}
        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
            <FileText className="inline mr-2" size={20} />
            Type d'analyse *
          </label>
          <select
            value={formData.examType}
            onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-base sm:text-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
            required
          >
            <option value="">Sélectionner un type...</option>
            {EXAM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* ========== DATE ========== */}
        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
            <Calendar className="inline mr-2" size={20} />
            Date de l'analyse *
          </label>
          <input
            type="date"
            value={formData.orderDate}
            onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-base sm:text-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
            required
          />
        </div>

        {/* ========== INSTRUCTIONS ========== */}
        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Instructions / Description
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Instructions spécifiques pour le patient..."
            className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-base sm:text-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
            rows={4}
          />
        </div>

        {/* ========== ZONE UPLOAD ========== */}
        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
            <Upload className="inline mr-2" size={20} />
            Fichiers joints (PDF, images)
          </label>

          {/* Zone drag & drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-[#006D65] bg-[#006D65]/5' : 'border-gray-300 hover:border-[#006D65]'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploadingFile}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-base sm:text-lg text-gray-700 font-medium">
                {uploadingFile ? 'Upload en cours...' : 'Cliquez ou glissez vos fichiers ici'}
              </p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                PDF, JPG, PNG, Word (max 10MB par fichier)
              </p>
            </label>
          </div>

          {/* Bouton Scanner */}
          <button
            type="button"
            onClick={() => {
              setShowScanner(true);
              setScanStep('camera');
              openCamera();
            }}
            className="w-full mt-4 border-2 border-[#006D65] text-[#006D65] px-5 py-4 rounded-xl hover:bg-[#006D65] hover:text-white transition-colors flex items-center justify-center gap-2 text-base sm:text-lg font-semibold"
          >
            <Camera size={22} />
            Scanner un document
          </button>

          {/* Liste fichiers */}
          {files.length > 0 && (
            <div className="mt-4 space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-5 py-3 rounded-xl border border-gray-200"
                >
                  <span className="text-sm sm:text-base text-gray-700 truncate flex-1 font-medium">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 ml-3"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== MESSAGE ERREUR ========== */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl text-base sm:text-lg font-medium">
            {error}
          </div>
        )}

        {/* ========== BOUTON SUBMIT ========== */}
        <button
          type="submit"
          disabled={loading || uploadingFile}
          className="w-full bg-[#006D65] hover:bg-[#004d47] text-white py-4 sm:py-5 px-6 rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={24} />
              Envoi en cours...
            </>
          ) : (
            <>
              <Upload size={24} />
              Envoyer l'analyse
            </>
          )}
        </button>
      </form>

      {/* ==================== MODAL SCANNER ==================== */}
      {showScanner && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Scanner un document</h2>
                <button onClick={closeScanner} className="text-gray-400 hover:text-gray-600 text-4xl">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Canvas caché pour traitement */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* ========== ÉTAPE 1 : CAMÉRA ========== */}
              {scanStep === 'camera' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-2xl text-gray-700 mb-6">
                      Positionnez votre document devant la caméra
                    </p>
                  </div>

                  {/* Vidéo en direct */}
                  <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    
                    {/* Guide visuel */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-[#E6A930] border-dashed rounded-lg w-[80%] h-[80%]"></div>
                    </div>
                  </div>

                  {/* Bouton Capturer */}
                  <div className="flex justify-center">
                    <button
                      onClick={capturePhoto}
                      disabled={!videoStream}
                      className="bg-[#006D65] hover:bg-[#004d47] text-white px-12 py-5 rounded-full font-bold text-xl sm:text-2xl disabled:opacity-50 transition-colors shadow-lg"
                    >
                      📷 Capturer
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={closeScanner}
                      className="text-gray-600 hover:text-gray-800 text-xl underline"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* ========== ÉTAPE 2 : PRÉVISUALISATION ========== */}
              {scanStep === 'preview' && capturedImage && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-2xl text-gray-700 mb-6">
                      Vérifiez votre capture
                    </p>
                  </div>

                  {/* Image capturée */}
                  <div className="bg-gray-100 rounded-xl p-4">
                    <img
                      src={capturedImage}
                      alt="Document capturé"
                      className="max-w-full mx-auto rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setScanStep('camera');
                        openCamera();
                      }}
                      className="px-8 py-4 border-2 border-[#006D65] text-[#006D65] rounded-xl hover:bg-[#006D65] hover:text-white transition-colors text-base sm:text-lg font-semibold"
                    >
                      🔄 Reprendre
                    </button>
                    <button
                      onClick={() => {
                        setEditedImage(capturedImage);
                        setScanStep('edit');
                      }}
                      className="bg-[#006D65] hover:bg-[#004d47] text-white px-8 py-4 rounded-xl transition-colors text-base sm:text-lg font-semibold"
                    >
                      ✏️ Éditer
                    </button>
                  </div>
                </div>
              )}

              {/* ========== ÉTAPE 3 : ÉDITION AVEC ZOOM ========== */}
              {scanStep === 'edit' && editedImage && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-2xl text-gray-700 mb-6">
                      Ajustez votre document
                    </p>
                  </div>

                  {/* Image avec zoom et pan */}
                  <div className="bg-gray-100 rounded-xl p-4 overflow-hidden">
                    <div
                      className="flex justify-center relative cursor-move"
                      style={{
                        width: '100%',
                        height: '500px',
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
                        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                          Zoom: {Math.round(zoomLevel * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ========== CONTRÔLES D'ÉDITION ========== */}
                  <div className="space-y-6 bg-white p-6 rounded-xl border-2 border-gray-200">

                    {/* Contrôle Zoom */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        🔍 Zoom: {Math.round(zoomLevel * 100)}%
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newZoom = Math.max(0.5, zoomLevel - 0.25);
                            setZoomLevel(newZoom);
                            if (newZoom === 1) {
                              setPanPosition({ x: 0, y: 0 });
                            }
                          }}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-2xl font-bold transition-colors"
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
                          className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-2xl font-bold transition-colors"
                        >
                          +
                        </button>
                        {zoomLevel !== 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setZoomLevel(1);
                              setPanPosition({ x: 0, y: 0 });
                            }}
                            className="px-4 py-3 text-red-600 hover:text-red-700 text-lg underline"
                          >
                            Réinitialiser
                          </button>
                        )}
                      </div>
                      {zoomLevel > 1 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Cliquez et glissez pour déplacer l'image
                        </p>
                      )}
                    </div>

                    {/* Rotation */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        🔄 Rotation
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setRotation(prev => prev - 90)}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-medium transition-colors"
                        >
                          ↶ -90°
                        </button>
                        <span className="text-xl font-bold text-[#006D65] min-w-[80px] text-center">
                          {rotation}°
                        </span>
                        <button
                          type="button"
                          onClick={() => setRotation(prev => prev + 90)}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-medium transition-colors"
                        >
                          ↷ +90°
                        </button>
                        {rotation !== 0 && (
                          <button
                            type="button"
                            onClick={() => setRotation(0)}
                            className="px-4 py-3 text-red-600 hover:text-red-700 text-lg underline"
                          >
                            Réinitialiser
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Luminosité */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        ☀️ Luminosité: {brightness}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Contraste */}
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        🎨 Contraste: {contrast}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Bouton réinitialisation totale */}
                    {(brightness !== 100 || contrast !== 100 || rotation !== 0 || zoomLevel !== 1) && (
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setRotation(0);
                          setZoomLevel(1);
                          setPanPosition({ x: 0, y: 0 });
                        }}
                        className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-lg font-medium"
                      >
                        🔄 Réinitialiser tous les réglages
                      </button>
                    )}
                  </div>

                  {/* Boutons navigation */}
                  <div className="flex gap-4 justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setScanStep('preview');
                        setRotation(0);
                        setBrightness(100);
                        setContrast(100);
                        setZoomLevel(1);
                        setPanPosition({ x: 0, y: 0 });
                      }}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-xl font-medium"
                    >
                      ← Retour
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await applyImageEdits();
                        await new Promise(resolve => setTimeout(resolve, 100));
                        saveScan();
                      }}
                      className="bg-[#006D65] hover:bg-[#004d47] text-white px-8 py-4 rounded-xl transition-colors text-xl font-medium"
                    >
                      ✅ Enregistrer le scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnvoyerAnalyseForm;