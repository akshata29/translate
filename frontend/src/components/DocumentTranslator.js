import React, { useState } from 'react';
import axios from 'axios';

const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain'];

function DocumentTranslator() {
  const [file, setFile] = useState(null);
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('fr');
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [translatedUrl, setTranslatedUrl] = useState('');
  const [error, setError] = useState('');

  // Load languages on mount
  React.useEffect(() => {
    const fetchLanguages = async () => {
      const res = await axios.get('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0');
      const langs = res.data.translation;
      const list = Object.keys(langs).map(code => ({
        code,
        name: langs[code].name,
      }));
      setLanguages(list);
    };
    fetchLanguages();
  }, []);

  const handleUpload = async () => {
    setError('');
    if (!file) {
      setError('Please upload a document.');
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setError('Only DOCX, PDF, and TXT files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('from', from);
    formData.append('to', to);

    setLoading(true);
    setTranslatedUrl('');
    try {
      const res = await axios.post('http://localhost:5000/translate-single-document', formData);
      setTranslatedUrl(res.data.downloadUrl);
    } catch (err) {
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold mb-2">Upload a document (DOCX, PDF, TXT)</label>
        <input
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setTranslatedUrl('');
          }}
          className="border p-2 rounded-lg w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Source language</label>
          <select
            className="w-full border p-2 rounded-lg"
            onChange={(e) => setFrom(e.target.value)}
            value={from}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Target language</label>
          <select
            className="w-full border p-2 rounded-lg"
            onChange={(e) => setTo(e.target.value)}
            value={to}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
          onClick={() => {
            setFile(null);
            setTranslatedUrl('');
            setError('');
          }}
        >
          Clear
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Translating...' : 'Submit'}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {translatedUrl && (
        <div className="mt-4">
          <a
            href={translatedUrl}
            className="text-blue-600 underline font-medium"
            download
          >
            📥 Download Translated Document
          </a>
        </div>
      )}
    </div>
  );
}

export default DocumentTranslator;
