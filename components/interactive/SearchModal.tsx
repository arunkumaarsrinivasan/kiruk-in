import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from '../ui/sketch-elements';

interface SearchModalProps {
  show: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: string[];
  allItems: any[];
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  show, 
  onClose, 
  searchTerm, 
  setSearchTerm, 
  searchResults, 
  allItems 
}) => {  const handleResultClick = (itemId: string) => {
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
      element.style.transition = 'box-shadow 0.3s ease';
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 3000);
    }
  };

  const getItemTitle = (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return itemId;
    
    if (typeof item.content === 'string') {
      return item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content;
    }
    
    return `${item.type} item`;
  };

  const getItemType = (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    return item ? item.type : 'unknown';
  };

  return (
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
            className="bg-white border-2 border-blue-500 rounded-lg p-6 max-w-md w-full mx-4 sketch-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <SketchHeading level={3} className="text-lg">🔍 Search Portfolio</SketchHeading>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </motion.button>
            </div>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search portfolio items..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none handwritten"
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1 handwritten">
                Search by content or item type
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {searchTerm.trim() === '' ? (
                <div className="text-center text-gray-500 py-8 handwritten">
                  💡 Start typing to search your portfolio items
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8 handwritten">
                  🤷‍♂️ No items found for "{searchTerm}"
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-2 handwritten">
                    Found {searchResults.length} item{searchResults.length !== 1 ? 's' : ''}:
                  </div>
                  {searchResults.map((itemId, index) => (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        handleResultClick(itemId);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm handwritten text-gray-800">
                            {getItemTitle(itemId)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                              {getItemType(itemId)}
                            </span>
                          </div>
                        </div>
                        <div className="text-blue-500 text-sm">→</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Tips */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-800 handwritten">
                <strong>💡 Search Tips:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Search by content text or item type</li>
                  <li>• Click results to jump to items</li>
                  <li>• Use Ctrl+F as a shortcut</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
