"use client";
import { useState } from "react";

type SearchAndFilterProps = {
  onSearch: (query: string) => void;
  onFilterByTag: (tag: string | null) => void;
  availableTags: string[];
  selectedTag: string | null;
  searchQuery: string;
};

export default function SearchAndFilter({
  onSearch,
  onFilterByTag,
  availableTags,
  selectedTag,
  searchQuery
}: SearchAndFilterProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Filter by tags */}
        <div className="relative">
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-full bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {selectedTag || "All Topics"}
            <svg className={`w-4 h-4 transition-transform duration-200 ${isTagsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Tags dropdown */}
          {isTagsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  onFilterByTag(null);
                  setIsTagsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  !selectedTag ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                }`}
              >
                All Topics
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onFilterByTag(tag);
                    setIsTagsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                    selectedTag === tag ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Clear filters */}
        {(selectedTag || searchQuery) && (
          <button
            onClick={() => {
              onSearch("");
              onFilterByTag(null);
            }}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Active filters display */}
      {(selectedTag || searchQuery) && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearch("")}
                className="ml-1 hover:text-blue-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              Tag: {selectedTag}
              <button
                onClick={() => onFilterByTag(null)}
                className="ml-1 hover:text-purple-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
