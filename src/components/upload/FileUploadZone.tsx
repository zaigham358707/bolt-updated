import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File as FileIcon, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface FileUploadZoneProps {
  onFilesUploaded?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  acceptedTypes = ['*'],
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  multiple = true,
  disabled = false,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addFiles } = useAppStore();

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      case 'audio':
        return <Music className="h-8 w-8" />;
      case 'text':
      case 'application':
        if (file.type.includes('pdf') || file.type.includes('document')) {
          return <FileText className="h-8 w-8" />;
        }
        if (file.type.includes('zip') || file.type.includes('rar')) {
          return <Archive className="h-8 w-8" />;
        }
        return <FileIcon className="h-8 w-8" />;
      default:
        return <FileIcon className="h-8 w-8" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`;
    }
    
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*')) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isTypeAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return type.slice(1) === fileExtension;
        }
        return fileType.startsWith(type.replace('*', ''));
      });
      
      if (!isTypeAccepted) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }
    
    return null;
  };

  const generateThumbnail = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxSize = 300;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
    
    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(5, video.duration / 2);
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxSize = 300;
          const ratio = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight);
          canvas.width = video.videoWidth * ratio;
          canvas.height = video.videoHeight * ratio;
          
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      });
    }
    
    return undefined;
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    const validFiles: File[] = [];
    const progressItems: UploadProgress[] = [];

    // Validate files first
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        progressItems.push({
          file,
          progress: 0,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
        progressItems.push({
          file,
          progress: 0,
          status: 'uploading'
        });
      }
    }

    setUploadProgress(progressItems);

    // Process valid files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadProgress(prev => prev.map(item => 
            item.file === file 
              ? { ...item, progress }
              : item
          ));
        }

        // Generate thumbnail
        const thumbnail = await generateThumbnail(file);
        
        // Create file item
        const fileItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' as const :
                file.type.startsWith('video/') ? 'video' as const :
                file.type.startsWith('audio/') ? 'audio' as const :
                file.type.includes('pdf') || file.type.includes('document') ? 'document' as const :
                'archive' as const,
          size: file.size,
          thumbnail,
          createdAt: new Date(),
          modifiedAt: new Date(file.lastModified),
          isFavorite: false,
          tags: [],
          metadata: {
            originalFile: file
          }
        };

        // Add to store
        addFiles([fileItem]);

        // Mark as completed
        setUploadProgress(prev => prev.map(item => 
          item.file === file 
            ? { ...item, progress: 100, status: 'completed' }
            : item
        ));

      } catch (error) {
        setUploadProgress(prev => prev.map(item => 
          item.file === file 
            ? { ...item, status: 'error', error: 'Failed to process file' }
            : item
        ));
      }
    }

    // Clear progress after delay
    setTimeout(() => {
      setUploadProgress([]);
      setIsUploading(false);
    }, 2000);

    onFilesUploaded?.(validFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeUploadItem = (file: File) => {
    setUploadProgress(prev => prev.filter(item => item.file !== file));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <motion.div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          "hover:border-blue-400 hover:bg-blue-500/5",
          isDragOver && "border-blue-500 bg-blue-500/10 scale-105",
          disabled && "opacity-50 cursor-not-allowed",
          "border-white/20 bg-white/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4">
          <motion.div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-blue-500/20 text-blue-400"
            )}
            animate={{ 
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0 
            }}
          >
            <Upload className="h-8 w-8" />
          </motion.div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragOver ? 'Drop files here' : 'Upload Files'}
            </h3>
            <p className="text-white/60 text-sm">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-white/40 text-xs mt-1">
              Max size: {Math.round(maxFileSize / (1024 * 1024))}MB
              {acceptedTypes.length > 0 && !acceptedTypes.includes('*') && 
                ` • Types: ${acceptedTypes.join(', ')}`
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-white font-medium">Upload Progress</h4>
            {uploadProgress.map((item, index) => (
              <motion.div
                key={`${item.file.name}-${index}`}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-white/70">
                    {getFileIcon(item.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate">
                        {item.file.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                        )}
                        {item.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                        {item.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                        <Button
                          onClick={() => removeUploadItem(item.file)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/50 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {item.status === 'error' ? (
                      <p className="text-red-400 text-xs">{item.error}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <motion.div
                            className="bg-blue-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-white/60 text-xs">
                          {item.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadZone;