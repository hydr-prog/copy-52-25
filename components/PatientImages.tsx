
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Maximize2, X, Cloud, Link, FileImage, Download, Loader2, Info, CheckCircle, AlertTriangle, RefreshCw, Key, ShieldCheck, ShieldAlert, ZoomIn, ZoomOut, RotateCw, RotateCcw, DownloadCloud, Maximize, AlertCircle } from 'lucide-react';
import { Patient, PatientImage } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface DriveImageItemProps {
    img: PatientImage;
    onMaximize: (img: PatientImage) => void;
    onDelete: () => void;
    t: any;
}

const DriveImageItem: React.FC<DriveImageItemProps> = ({ img, onMaximize, onDelete, t }) => {
    return (
        <div className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
            <img 
                src={img.url} 
                alt={img.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                loading="lazy"
            />
            
            {/* Buttons Overlay: Always visible on mobile, hover on desktop */}
            <div className="absolute inset-0 bg-black/30 md:bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                    onClick={() => onMaximize(img)} 
                    className="p-3 md:p-3 bg-white/30 backdrop-blur-md text-white rounded-full hover:bg-white/50 transition transform hover:scale-110 shadow-lg"
                >
                    <Maximize2 size={20} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                    className="p-3 md:p-3 bg-red-500/40 backdrop-blur-md text-white rounded-full hover:bg-red-500/60 transition transform hover:scale-110 shadow-lg"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[9px] md:text-[10px] px-2 py-1.5 font-bold truncate opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {new Date(img.date).toLocaleDateString()} - {img.name}
            </div>
            
            {img.driveFileId && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white p-1 rounded-md shadow-sm z-10">
                    <Cloud size={10} />
                </div>
            )}
        </div>
    );
};

interface PatientImagesProps {
  t: any;
  patient: Patient;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  googleDriveLinked?: boolean;
  googleDriveRootId?: string;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const PatientImages: React.FC<PatientImagesProps> = ({ t, patient, onUpdatePatient, googleDriveLinked, googleDriveRootId, openConfirm }) => {
  const [selectedImageData, setSelectedImageData] = useState<PatientImage | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Viewer controls state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const images = patient.images || [];
  const unsyncedCount = images.filter(img => !img.driveFileId).length;

  useEffect(() => {
    let objectUrl: string | null = null;
    if (!selectedImageData) {
        setViewerUrl(null);
        setIsViewerLoading(false);
        return;
    }

    const loadHighRes = async () => {
        setViewerUrl(selectedImageData.url);
        
        if (!selectedImageData.driveFileId || !googleDriveService.hasActiveToken()) {
            return;
        }

        setIsViewerLoading(true);
        try {
            const url = await googleDriveService.getFileBlobUrl(selectedImageData.driveFileId);
            objectUrl = url;
            setViewerUrl(url);
        } catch (err) {
            console.warn("Failed to upgrade to HD, staying on preview URL.");
        } finally {
            setIsViewerLoading(false);
        }
    };

    loadHighRes();

    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [selectedImageData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const oversized = fileList.filter(f => f.size > 15 * 1024 * 1024);
    if (oversized.length > 0) {
        alert(t.currentLang === 'ar' ? "بعض الصور حجمها كبير جداً (الأقصى 15 ميجا)" : "Some files too large (Max 15MB)");
        return;
    }

    setIsUploading(true);
    const newImages: PatientImage[] = [];
    
    try {
        const readFiles = fileList.map((file, i) => {
            return new Promise<PatientImage>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({
                    id: (Date.now() + i).toString(),
                    url: reader.result as string,
                    name: file.name,
                    date: new Date().toISOString()
                });
                reader.readAsDataURL(file);
            });
        });
        const results = await Promise.all(readFiles);
        onUpdatePatient(patient.id, { images: [...results, ...images] });
    } catch (error: any) {
        alert(error.message);
    } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
    }
  };

  const handleDeleteImage = (img: PatientImage) => {
    openConfirm(t.images, t.confirmDeleteImage, async () => {
        if (img.driveFileId && googleDriveLinked) {
            try {
                await googleDriveService.deleteFile(img.driveFileId);
            } catch (e) {}
        }
        const updatedImages = images.filter(i => i.id !== img.id);
        onUpdatePatient(patient.id, { images: updatedImages });
    });
  };

  const resetViewer = () => {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setSelectedImageData(null);
  };

  const toggleFullscreen = () => {
      if (!viewerRef.current) return;
      if (!document.fullscreenElement) {
          viewerRef.current.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
      } else {
          document.exitFullscreen();
      }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      if (zoom <= 1 && rotation === 0) return; 
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPosition({
          x: clientX - dragStart.current.x,
          y: clientY - dragStart.current.y
      });
  };

  const handleEnd = () => {
      setIsDragging(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ImageIcon className="text-primary-500" />
                    {t.patientImages}
                </h3>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary-700 transition cursor-pointer transform hover:-translate-y-0.5 active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload size={18} />
                    <span>{t.uploadImage}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} multiple />
                </label>
            </div>
        </div>

        {/* Unsynced Alert */}
        {unsyncedCount > 0 && googleDriveLinked && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-orange-800 dark:text-orange-300 font-bold">{t.unsyncedAlert}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">{t.goToSettingsToSync}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="animate-fade-in">
            {!googleDriveLinked && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-xs md:text-sm text-amber-800 dark:text-amber-300 font-bold leading-relaxed">{t.linkDriveInSettings}</p>
                </div>
            )}
        </div>

        {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-400">
                <FileImage size={64} className="mb-4 opacity-20" />
                <p className="font-medium">{t.noImages}</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(img => (
                    <DriveImageItem 
                        key={img.id} 
                        img={img} 
                        t={t} 
                        onMaximize={(data) => setSelectedImageData(data)} 
                        onDelete={() => handleDeleteImage(img)} 
                    />
                ))}
            </div>
        )}

        {/* Responsive Viewer */}
        {selectedImageData && (
            <div 
                ref={viewerRef}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in select-none"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-3 md:p-6 text-white shrink-0 border-b border-white/10 bg-black/40">
                    <div className="flex flex-col overflow-hidden max-w-[60%]">
                        <span className="font-bold text-sm md:text-lg truncate">{selectedImageData.name}</span>
                        <span className="text-[9px] md:text-[10px] opacity-50 uppercase tracking-widest">{new Date(selectedImageData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                        {isViewerLoading && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 bg-white/10 rounded-full shrink-0">
                                <RefreshCw size={10} className="animate-spin text-primary-400" />
                                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter">HD...</span>
                            </div>
                        )}
                        <button onClick={toggleFullscreen} className="p-2 md:p-3 hover:bg-white/10 rounded-full transition text-white/80">
                            <Maximize size={20} />
                        </button>
                        <button onClick={resetViewer} className="p-2 md:p-2 hover:bg-white/10 rounded-full transition group">
                            <X size={28} className="md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Display Area */}
                <div 
                    className="flex-1 relative flex items-center justify-center overflow-hidden p-4 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                    style={{ touchAction: 'none' }}
                >
                    {viewerUrl ? (
                        <img 
                            key={selectedImageData.id}
                            src={viewerUrl} 
                            alt="Full view" 
                            draggable={false}
                            onError={() => {
                                if (viewerUrl !== selectedImageData.url) {
                                    setViewerUrl(selectedImageData.url);
                                }
                            }}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                            }}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg pointer-events-none" 
                        />
                    ) : (
                        <RefreshCw size={48} className="animate-spin text-white/20" />
                    )}
                </div>

                {/* Flexible Toolbar */}
                <div className="p-4 md:p-8 shrink-0 flex justify-center border-t border-white/10 bg-black/60">
                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-6 bg-white/10 backdrop-blur-xl p-2 md:p-3 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl max-w-[95vw]">
                        
                        <div className="flex items-center gap-1 border-white/10 border-e pe-2 md:pe-5">
                            <button onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))} className="p-2 md:p-3 hover:bg-white/20 rounded-xl transition text-white">
                                <ZoomOut size={20} className="md:w-6 md:h-6" />
                            </button>
                            <span className="text-white font-mono font-bold text-[10px] md:text-xs min-w-[40px] md:min-w-[50px] text-center bg-white/5 py-1 rounded-lg">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button onClick={() => setZoom(prev => Math.min(8, prev + 0.25))} className="p-2 md:p-3 hover:bg-white/20 rounded-xl transition text-white">
                                <ZoomIn size={20} className="md:w-6 md:h-6" />
                            </button>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2 border-white/10 border-e pe-2 md:pe-5">
                            <button onClick={() => setRotation(prev => prev - 90)} className="p-2 md:p-3 hover:bg-white/20 rounded-xl transition text-white">
                                <RotateCcw size={20} className="md:w-6 md:h-6" />
                            </button>
                            <button onClick={() => setRotation(prev => prev + 90)} className="p-2 md:p-3 hover:bg-white/20 rounded-xl transition text-white">
                                <RotateCw size={20} className="md:w-6 md:h-6" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <a 
                                href={viewerUrl || selectedImageData.url} 
                                download={selectedImageData.name} 
                                className="p-2.5 md:p-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl md:rounded-2xl shadow-lg transition flex items-center gap-2 font-bold text-xs md:text-sm"
                            >
                                <DownloadCloud size={20} className="md:w-6 md:h-6" />
                                <span className="hidden xs:inline">{t.download || "Download"}</span>
                            </a>
                            <button 
                                onClick={() => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); }} 
                                className="p-2.5 md:p-3 hover:bg-white/20 rounded-xl transition text-white/70 text-[10px] md:text-xs font-bold uppercase"
                            >
                                {t.reset}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
