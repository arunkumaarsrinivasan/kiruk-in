import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from '../ui/sketch-elements';
import { DraggableItem } from './draggable-notebook';

interface TemplatesModalProps {
  show: boolean;
  onClose: () => void;
  workspaceTemplates: any[];
  setNotebookItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ show, onClose, workspaceTemplates, setNotebookItems }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white border-2 border-purple-500 rounded-lg p-6 max-w-md w-full mx-4 sketch-border"
          onClick={e => e.stopPropagation()}
        >
          <SketchHeading level={2} className="text-xl mb-4 text-center">
            📋 Templates
          </SketchHeading>
          <div className="space-y-4">
            {workspaceTemplates.map((template) => (
              <motion.div
                key={template.id}
                className="p-4 rounded-lg border-2 bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.items.map((item: any) => (
                    <div key={item.id} className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {item.type}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const allowedTypes = [
                        'sticky-note',
                        'sketch-card',
                        'photo',
                        'doodle',
                        'text-block',
                        'sketch-element',
                      ];
                      const filteredItems = template.items.filter(
                        (item: any): item is DraggableItem => allowedTypes.includes(item.type)
                      );
                      setNotebookItems(prev => [
                        ...prev,
                        ...filteredItems
                      ]);
                      onClose();
                    }}
                    className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
                  >
                    Use Template
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);