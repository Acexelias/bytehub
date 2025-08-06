import React from "react";
import { motion } from "framer-motion";

export default function ResourceFilters({ categories, activeCategory, setActiveCategory }) {
  const allCategories = ["all", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map(category => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 relative ${
            activeCategory === category 
              ? "text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          {activeCategory === category && (
            <motion.div
              layoutId="activeResourceCategory"
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            />
          )}
          <span className="relative z-10 capitalize">{category.replace(/_/g, ' ')}</span>
        </button>
      ))}
    </div>
  );
}