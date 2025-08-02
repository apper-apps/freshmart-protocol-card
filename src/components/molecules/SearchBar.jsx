import React, { useState } from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ onSearch, placeholder = "Search products..." }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-4"
      />
      <ApperIcon 
        name="Search" 
        size={20} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
      />
    </form>
  );
};

export default SearchBar;