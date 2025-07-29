import { useState, useEffect } from 'react';

interface ArcjetStatusProps {
  className?: string;
}

export function ArcjetStatus({ className = '' }: ArcjetStatusProps) {
  const protectionStatus = {
    rateLimit: true,
    botProtection: true,
    shield: true,
  };

  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    // Simulate request counting for demo purposes
    const interval = setInterval(() => {
      setRequestCount(prev => (prev + 1) % 100);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
        🛡️ Arcjet Security Status
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${protectionStatus.shield ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-gray-700">Shield Protection</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${protectionStatus.rateLimit ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-gray-700">Rate Limiting</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${protectionStatus.botProtection ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-gray-700">Bot Detection</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="text-xs text-gray-600">
          Protected requests: <span className="font-mono text-blue-600">{requestCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
