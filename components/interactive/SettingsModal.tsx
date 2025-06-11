import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from '../ui/sketch-elements';

interface InteractivePortfolioSettings {
  enableAI: boolean;
  enableTimeline: boolean;
  enableAnalytics: boolean;
  enableExport: boolean;
  enableThemes: boolean;
  enableMultiLanguage: boolean;
  autoSave: boolean;
  collaborationMode: boolean;
}

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  settings: InteractivePortfolioSettings;
  onSettingsChange: (settings: InteractivePortfolioSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  show, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [localSettings, setLocalSettings] = useState<InteractivePortfolioSettings>(settings);

  const handleSettingChange = (key: keyof InteractivePortfolioSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const settingsConfig = [
    {
      key: 'enableAI' as keyof InteractivePortfolioSettings,
      title: '🤖 AI Recommendations',
      description: 'Get AI-powered suggestions for portfolio improvements',
      category: 'Intelligence'
    },
    {
      key: 'enableTimeline' as keyof InteractivePortfolioSettings,
      title: '⏰ Portfolio Timeline',
      description: 'Show chronological journey and milestones',
      category: 'Experience'
    },
    {
      key: 'enableAnalytics' as keyof InteractivePortfolioSettings,
      title: '📊 Live Analytics',
      description: 'Track interactions and engagement metrics',
      category: 'Analytics'
    },
    {
      key: 'enableExport' as keyof InteractivePortfolioSettings,
      title: '💾 Export Options',
      description: 'Enable portfolio export in multiple formats',
      category: 'Data'
    },
    {
      key: 'enableThemes' as keyof InteractivePortfolioSettings,
      title: '🎨 Theme Customization',
      description: 'Allow custom color schemes and styling',
      category: 'Appearance'
    },
    {
      key: 'enableMultiLanguage' as keyof InteractivePortfolioSettings,
      title: '🌍 Multi-Language',
      description: 'Support for multiple languages',
      category: 'Accessibility'
    },
    {
      key: 'autoSave' as keyof InteractivePortfolioSettings,
      title: '💾 Auto-Save',
      description: 'Automatically save changes every 30 seconds',
      category: 'Data'
    },
    {
      key: 'collaborationMode' as keyof InteractivePortfolioSettings,
      title: '👥 Collaboration Mode',
      description: 'Enable real-time collaboration features',
      category: 'Sharing'
    }
  ];

  const categories = Array.from(new Set(settingsConfig.map(s => s.category)));

  const resetToDefaults = () => {
    const defaultSettings: InteractivePortfolioSettings = {
      enableAI: true,
      enableTimeline: true,
      enableAnalytics: true,
      enableExport: true,
      enableThemes: false,
      enableMultiLanguage: false,
      autoSave: true,
      collaborationMode: false
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
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
            className="bg-white border-2 border-gray-500 rounded-lg p-6 max-w-lg w-full mx-4 sketch-border max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <SketchHeading level={3} className="text-lg">⚙️ Portfolio Settings</SketchHeading>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </motion.button>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto">
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 handwritten border-b border-gray-200 pb-1">
                    {category}
                  </h4>
                  <div className="space-y-3">
                    {settingsConfig
                      .filter(setting => setting.category === category)
                      .map(setting => (
                        <motion.div
                          key={setting.key}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          whileHover={{ scale: 1.01 }}
                        >                          <div className="flex-1">
                            <div className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localSettings[setting.key]}
                                onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div>
                                <div className="font-medium text-sm handwritten text-gray-800">
                                  {setting.title}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {setting.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-4 mt-4 flex gap-3">
              <motion.button
                onClick={resetToDefaults}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm handwritten"
              >
                🔄 Reset to Defaults
              </motion.button>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm handwritten"
              >
                ✅ Save Settings
              </motion.button>
            </div>

            {/* Info Section */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-xs text-yellow-800 handwritten">
                <strong>💡 Settings Info:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Settings are saved automatically</li>
                  <li>• Some features may require page refresh</li>
                  <li>• Reset to restore default configuration</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
