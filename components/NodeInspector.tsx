"use client";

import React from "react";
import { X } from "lucide-react";
import { Node } from "reactflow";

interface NodeInspectorProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export default function NodeInspector({
  node,
  isOpen,
  onClose,
  onUpdate,
}: NodeInspectorProps) {
  if (!isOpen || !node) return null;

  const renderInspector = () => {
    switch (node.type) {
      case "llmNode":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={node.data?.model || "gemini-1.5-flash"}
                onChange={(e) =>
                  onUpdate(node.id, { model: e.target.value })
                }
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
              </select>
            </div>
          </div>
        );

      case "cropImageNode":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={node.data?.width_percent || 100}
                onChange={(e) =>
                  onUpdate(node.id, { width_percent: parseFloat(e.target.value) })
                }
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (%)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={node.data?.height_percent || 100}
                onChange={(e) =>
                  onUpdate(node.id, { height_percent: parseFloat(e.target.value) })
                }
                min="0"
                max="100"
              />
            </div>
          </div>
        );

      case "extractFrameNode":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timestamp (seconds)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={node.data?.timestamp || 0}
                onChange={(e) =>
                  onUpdate(node.id, { timestamp: parseFloat(e.target.value) })
                }
                min="0"
                step="0.1"
              />
            </div>
          </div>
        );

      case "textNode":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                rows={6}
                value={node.data?.text || ""}
                onChange={(e) =>
                  onUpdate(node.id, { text: e.target.value })
                }
              />
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500 text-sm">No properties available</div>;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-lg z-20 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Node Inspector</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={node.data?.label || node.type}
            onChange={(e) =>
              onUpdate(node.id, { label: e.target.value })
            }
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Type</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
              {node.type}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Position</span>
            <span className="text-xs text-gray-500">
              X: {Math.round(node.position.x)}, Y: {Math.round(node.position.y)}
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Node Properties
          </h4>
          {renderInspector()}
        </div>
      </div>
    </div>
  );
}
