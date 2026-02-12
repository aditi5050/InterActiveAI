"use client";

import React, { useState } from "react";
import { Trash2, Download, Upload, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkflowActionsProps {
  workflowId: string;
  workflowName: string;
  onNameChange?: (name: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

export default function WorkflowActions({
  workflowId,
  workflowName,
  onNameChange,
  onExport,
  onImport,
}: WorkflowActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workflow? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to delete workflow");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting workflow");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (onExport) {
      onExport();
    } else {
      try {
        const response = await fetch(
          `/api/workflows/export-import?id=${workflowId}`
        );
        if (response.ok) {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${workflowName || "workflow"}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Export error:", error);
      }
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImport) {
        onImport(file);
      }
    };
    input.click();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="Workflow actions"
      >
        <Settings className="w-4 h-4 text-gray-600" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-sm text-gray-700 border-b"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleImportClick}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-sm text-gray-700 border-b"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 text-sm text-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
