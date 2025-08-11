import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/search/article/${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (e) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search article..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded">
            Search
          </button>
        </div>
        {loading && <div>Searching...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <ul className="mt-4 space-y-2">
          {results.map((r, idx) => (
            <li key={idx} className="border rounded p-3">
              <div className="font-semibold">{r.item_name}</div>
              <div className="text-sm text-gray-600">{r.color} • {r.size} • {r.current_stock}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchBar; 