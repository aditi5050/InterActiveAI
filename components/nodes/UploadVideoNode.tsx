import React, { useCallback, useState, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { Video, UploadCloud, Trash2, Play, Pause } from 'lucide-react';

export function UploadVideoNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to update this node's data in React Flow
  const updateData = useCallback((newData: Record<string, any>) => {
    setNodes((nodes) => 
      nodes.map((node) => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [id, setNodes]);

  // Helper to delete this node from React Flow
  const deleteThisNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  const onDelete = useCallback(() => {
    deleteThisNode();
  }, [deleteThisNode]);

  const onFileChange = useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'video'); // Specify video type for API validation

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (response.ok && result.url) {
        updateData({ 
          videoUrl: result.url, 
          fileName: file.name,
          fileType: result.fileType,
          fileSize: result.fileSize
        });
      } else {
        console.error('Upload failed:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  }, [updateData]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!data) return null;

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-72 ${selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#EF4444]/10 rounded-t-lg border-[#2A2A2F]">
        <div className="flex items-center">
          <Video className="w-4 h-4 mr-2 text-[#EF4444]" />
          <span className="text-sm font-medium text-white">Upload Video</span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-900/30 rounded text-gray-600 hover:text-red-600 transition-colors"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3">
        {data?.videoUrl ? (
          <div className="relative group">
            {/* Video Player */}
            <video 
              ref={videoRef}
              src={data.videoUrl} 
              className="w-full h-36 object-contain rounded-md border border-[#2A2A2F] bg-black" 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Custom Controls */}
            <div className="mt-2 space-y-2">
              {/* Play/Pause and Time Display */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="p-1.5 bg-[#EF4444] hover:bg-[#DC2626] rounded text-white transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <span className="text-xs text-gray-400 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              {/* Seek Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-[#2A2A2F] rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
                style={{
                  background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(currentTime / (duration || 1)) * 100}%, #2A2A2F ${(currentTime / (duration || 1)) * 100}%, #2A2A2F 100%)`
                }}
              />
            </div>

            {/* Remove Button */}
            <button 
              onClick={() => {
                updateData({ videoUrl: null, fileName: null });
                setCurrentTime(0);
                setDuration(0);
                setIsPlaying(false);
              }}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-[#2A2A2F]"
              title="Remove video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* File Info */}
            <div className="mt-2 text-xs text-gray-400 truncate">{data?.fileName}</div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#2A2A2F] border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F42C1]"></div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-500">MP4, MOV, WebM</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="video/*" onChange={onFileChange} disabled={uploading} />
          </label>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-[#6F42C1] border-2 border-[#6F42C1]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-[#6F42C1] border-2 border-[#6F42C1]"
      />
    </div>
  );
}
