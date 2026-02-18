import React, { useCallback, useState, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Video, UploadCloud, Trash2, Play, Pause } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';

export function UploadVideoNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const saveToDatabase = useWorkflowStore((state) => state.saveToDatabase);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [error, setError] = useState<string | null>(null);

  // Helper to update this node's data using Zustand store
  const updateData = useCallback((newData: Record<string, any>) => {
    updateNodeData(id, newData);
  }, [id, updateNodeData]);


  // Helper to delete this node from React Flow
  const deleteThisNode = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const onDelete = useCallback(() => {
    deleteThisNode();
  }, [deleteThisNode]);

  const onFileChange = useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log("onFileChange triggered for node:", id);
    const file = evt.target.files?.[0];
    if (!file) {
        console.log("No file selected");
        return;
    }

    console.log("File selected:", file.name, file.size, file.type);
    setError(null);
    setUploading(true);

    // 1. Immediate Local Preview
    // Create a local object URL for immediate feedback
    let localUrl = '';
    try {
        localUrl = URL.createObjectURL(file);
        console.log("Setting local video preview:", localUrl);
        updateData({ 
            videoUrl: localUrl, 
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });
        console.log("updateData called with localUrl");
    } catch (e) {
        console.error("Error creating object URL", e);
        setError("Failed to create local preview");
    }
    
    try {
      // 2. Get upload signature from server
      console.log("Fetching upload signature...");
      const signatureResponse = await fetch('/api/upload/signature', {
        method: 'POST',
      });
      
      if (!signatureResponse.ok) {
        throw new Error(`Failed to get upload signature: ${signatureResponse.statusText}`);
      }

      const { url, params, signature } = await signatureResponse.json();
      console.log("Signature received", { url, paramsLength: params.length, signature });

      // 3. Upload directly to Transloadit
      console.log("Starting upload to Transloadit...");
      const formData = new FormData();
      formData.append('params', params);
      formData.append('signature', signature);
      formData.append('file', file);
      
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
         const errorText = await uploadResponse.text();
         console.error('Transloadit Upload Error:', uploadResponse.status, errorText);
         throw new Error(`Transloadit upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();
      console.log("Upload complete, result:", result);

      if (uploadResponse.ok) {
        let fileUrl = '';
        if (result.results && result.results[':original'] && result.results[':original'][0]) {
           fileUrl = result.results[':original'][0].ssl_url;
        } else {
           console.warn('Transloadit results not immediately available', result);
        }

        if (fileUrl) {
          // Update with the permanent remote URL
          console.log("Upload successful, updating to remote URL:", fileUrl);
          updateData({ 
            videoUrl: fileUrl, 
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          });
          
          // Save to DB so backend has access to the new URL
          setTimeout(() => saveToDatabase(), 100);
        } else if (result.assembly_url) {
           console.log("Results not ready, using assembly status URL or polling");
           // If results are not immediately available, we can rely on the assembly_url or just wait.
           // However, for Transloadit /upload/handle, it usually returns immediately.
           // Maybe we need to check other result keys or assembly_ssl_url?
           // If 'results' is empty, maybe the step failed or is processing?
           // Let's try to use the assembly_ssl_url if available as a fallback (though it's just the status JSON)
           
           // Better fallback: Check if there are any uploads at all
           if (result.uploads && result.uploads.length > 0) {
               fileUrl = result.uploads[0].ssl_url;
               console.log("Found file in uploads array:", fileUrl);
               updateData({ 
                    videoUrl: fileUrl, 
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
               });
               
               // Save to DB so backend has access to the new URL
               setTimeout(() => saveToDatabase(), 100);
           } else {
               console.error('Upload completed but no URL returned in results or uploads', result);
               setError("Upload processed but no file URL returned.");
           }
        } else {
           console.error('Upload completed but no URL returned', result);
           setError("Upload completed but processing is pending.");
        }
      } else {
        console.error('Upload failed:', result.error || 'Unknown error');
        setError(result.error || "Upload failed due to unknown error");
      }
    } catch (error: any) {
      console.error('Upload failed exception', error);
      setError(error.message || "Upload failed");
    } finally {
      setUploading(false);
      console.log("Upload process finished");
    }
  }, [id, updateData]);

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
              key={data.videoUrl} // Force re-render on URL change
              ref={videoRef}
              src={data.videoUrl} 
              className="w-full h-36 object-contain rounded-md border border-[#2A2A2F] bg-black" 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls={false} // Use custom controls
              playsInline
            />
            
            {/* Custom Controls */}
            <div className="mt-2 space-y-2">
              {/* Play/Pause and Time Display */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className={`p-1.5 ${error ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#EF4444] hover:bg-[#DC2626]'} rounded text-white transition-colors`}
                  title={isPlaying ? 'Pause' : 'Play'}
                  disabled={!!error}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <span className="text-xs text-gray-400 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                {uploading && <span className="text-xs text-blue-400 animate-pulse ml-2">Uploading...</span>}
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
                disabled={!!error}
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-2 text-xs text-red-500 bg-red-900/20 p-1 rounded border border-red-900/30">
                {error}
              </div>
            )}
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
