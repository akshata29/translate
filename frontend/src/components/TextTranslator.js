import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TextTranslator() {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [from, setFrom] = useState('en');
  const [to, setTo] = useState('fr');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      const response = await axios.get(
        'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0'
      );
      const langs = response.data.translation;
      const formatted = Object.keys(langs).map(code => ({
        code,
        name: langs[code].name,
      }));
      setLanguages(formatted);
    };
    fetchLanguages();
  }, []);

  const handleTranslate = async () => {
    const response = await axios.post('http://localhost:5000/translate-text', {
      text,
      from,
      to,
    });
    setTranslated(response.data.translatedText);
  };

  const examples = [
    {
      text: "Hello. Welcome to this presentation of Azure AI Translator",
      from: "English",
      to: "French",
    },
    {
      text: "Hola. Bienvenidos a esta presentación de Azure AI Translator",
      from: "Spanish",
      to: "Italian",
    },
    {
      text: "Bonjour à tous.",
      from: "French",
      to: "Arabic",
    },
  ];
  
  const handleExampleClick = (example) => {
    setText(example.text);
    setFrom(languages.find(lang => lang.name === example.from)?.code || 'en');
    setTo(languages.find(lang => lang.name === example.to)?.code || 'fr');
  };


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-2">Text to translate</label>
          <textarea
            rows="6"
            className="w-full p-2 border rounded-lg"
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
          <div className="mt-4">
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
          <div className="mt-4">
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
          <div className="mt-6 flex gap-4">
            <button
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              onClick={() => {
                setText('');
                setTranslated('');
              }}
            >
              Clear
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              onClick={handleTranslate}
            >
              Submit
            </button>
          </div>
        </div>
  
        <div>
          <label className="block font-semibold mb-2">Translated text</label>
          <textarea
            rows="6"
            readOnly
            className="w-full p-2 border rounded-lg bg-gray-100"
            value={translated}
          />
        </div>
      </div>
  
      {/* Full-width examples section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
          <span className="text-green-600">📄</span> Examples
        </h3>
        <div className="overflow-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Text to translate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Source language</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Target language</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {examples.map((ex, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleExampleClick(ex)}
                  className="cursor-pointer hover:bg-gray-100 transition duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">{ex.text}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{ex.from}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{ex.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );  
}

export default TextTranslator;
