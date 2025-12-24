'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  submitted_at: string;
  user_agent?: string;
  ip?: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export default function AdminDashboard() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'contacts'>('manual');

  const fetchContacts = useCallback(async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contacts', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data.contacts);
      setAuthenticated(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          action: 'mark_read'
        })
      });
      
      if (response.ok) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === id ? { ...contact, status: 'read' } : contact
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  useEffect(() => {
    if (authenticated) {
      fetchContacts();
    }
  }, [authenticated, fetchContacts]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-none shadow-lg max-w-md w-full"
        >
          <h1 className="text-2xl magnetic-font text-gray-900 mb-6 text-center">
            Admin Dashboard
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                id="token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin token"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-none hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-none">
              {error}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-none shadow-lg p-4 mb-6"
        >
          <h1 className="text-3xl magnetic-font text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your portfolio content and integrations</p>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="-mb-px flex space-x-10">
              <button
                onClick={() => setActiveTab('manual')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Manual Content
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contacts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📧 Contact Submissions ({contacts.filter(c => c.status === 'new').length})
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-none shadow-lg p-4 mb-6"
          >
            <div className="p-8 text-center">
              <h3 className="text-lg text-gray-700 mb-4">Personal Journey Content Management</h3>
              <p className="text-gray-600 mb-4">
                The personal journey content is now managed directly in the alternative-instagram.ts file.
                This simplified approach focuses on authentic personal moments from @arunum.avan.seyalum.
              </p>
              <p className="text-sm text-gray-500">
                Manual content admin will be available in a future update if needed.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'contacts' && (
          <>
            {/* Contact Submissions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-none shadow-lg p-4 mb-6"
            >
              <h2 className="text-2xl magnetic-font text-gray-900 mb-2">Contact Submissions</h2>
              <p className="text-gray-600">Manage contact form submissions from your portfolio</p>
            </motion.div>

            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && contacts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-none shadow-lg p-8 text-center"
              >
                <p className="text-gray-500 text-lg">No contact submissions yet</p>
              </motion.div>
            )}

            <div className="space-y-5">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-none shadow-lg p-4 border-l-4 ${
                    contact.status === 'new' ? 'border-blue-500' : 
                    contact.status === 'read' ? 'border-green-500' : 'border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-blue-600 hover:underline">{contact.email}</p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-1 rounded-none text-xs font-medium ${
                        contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        contact.status === 'read' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status}
                      </span>
                      {contact.status === 'new' && (
                        <button
                          onClick={() => markAsRead(contact.id)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-none transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Submitted: {new Date(contact.submitted_at).toLocaleString()}</p>
                    {contact.ip && <p>IP: {contact.ip}</p>}
                    {contact.user_agent && (
                      <details className="mt-2">
                        <summary className="cursor-pointer hover:text-gray-700">User Agent</summary>
                        <p className="mt-1 text-xs break-all">{contact.user_agent}</p>
                      </details>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
