import React, { useState } from 'react';
import TextTranslator from './components/TextTranslator';
import DocumentTranslator from './components/DocumentTranslator';

function App() {
  const [activeTab, setActiveTab] = useState('text');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Azure AI Translator</h1>
      <div className="bg-white rounded-xl shadow-md w-full max-w-4xl p-4">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Text Translation
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`px-4 py-2 mx-2 rounded-full ${
              activeTab === 'document' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Document Translation
          </button>
        </div>
        {activeTab === 'text' ? <TextTranslator /> : <DocumentTranslator />}
      </div>
    </div>
  );
}

export default App;
