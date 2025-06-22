import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import FileCard, { FileItem } from './file-card';
import { cn } from '@/lib/utils';

interface FileGridProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onFilePlay: (file: FileItem) => void;
  onFilePreview: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
  onDownload: (fileId: string) => void;
  onShare: (fileId: string) => void;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFilePlay,
  onFilePreview,
  onToggleFavorite,
  onDownload,
  onShare,
  searchQuery,
  sortBy,
  sortOrder
}) => {
  const [draggedFiles, setDraggedFiles] = useState<Set<string>>(new Set());

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = files.filter(file =>
        file.name.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting - create a copy of the array before sorting to avoid mutating read-only arrays
    const sortedFiles = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sortedFiles;
  }, [files, searchQuery, sortBy, sortOrder]);

  const handleDragStart = (fileId: string) => {
    setDraggedFiles(new Set([fileId]));
  };

  const handleDragEnd = () => {
    setDraggedFiles(new Set());
  };

  if (viewMode === 'list') {
    return (
      <div className="h-full overflow-auto">
        <motion.div
          className="space-y-2 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                layout
              >
                <FileCard
                  file={file}
                  isSelected={selectedFiles.has(file.id)}
                  onSelect={onFileSelect}
                  onPlay={onFilePlay}
                  onToggleFavorite={onToggleFavorite}
                  onDownload={onDownload}
                  onShare={onShare}
                  onPreview={onFilePreview}
                  viewMode="list"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const CARD_WIDTH = 300;
  const CARD_HEIGHT = 280;
  const GAP = 16;

  const Cell = ({ columnIndex, rowIndex, style, data }: any) => {
    const { files, columnsPerRow } = data;
    const fileIndex = rowIndex * columnsPerRow + columnIndex;
    const file = files[fileIndex];

    if (!file) return null;

    return (
      <div
        style={{
          ...style,
          left: (style.left as number) + GAP / 2,
          top: (style.top as number) + GAP / 2,
          width: (style.width as number) - GAP,
          height: (style.height as number) - GAP,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: fileIndex * 0.02 }}
          className="h-full"
        >
          <FileCard
            file={file}
            isSelected={selectedFiles.has(file.id)}
            onSelect={onFileSelect}
            onPlay={onFilePlay}
            onToggleFavorite={onToggleFavorite}
            onDownload={onDownload}
            onShare={onShare}
            onPreview={onFilePreview}
            viewMode="grid"
          />
        </motion.div>
      </div>
    );
  };

  return (
    <div className="h-full p-4">
      <AutoSizer>
        {({ height, width }) => {
          const columnsPerRow = Math.floor(width / (CARD_WIDTH + GAP));
          const rowCount = Math.ceil(filteredAndSortedFiles.length / columnsPerRow);

          return (
            <Grid
              height={height}
              width={width}
              columnCount={columnsPerRow}
              columnWidth={width / columnsPerRow}
              rowCount={rowCount}
              rowHeight={CARD_HEIGHT + GAP}
              itemData={{
                files: filteredAndSortedFiles,
                columnsPerRow,
              }}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default FileGrid;