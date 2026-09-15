import { useState } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

function SearchBar({ onSearch, placeholder }: SearchBarProps) {
    const [query, setQuery] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSearch(query);
        return false;
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder ?? "Search players…"}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
            />
            <button
                type="submit"
                className="rounded-md bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/30 disabled:opacity-50"
                disabled={query.length < 3}
            >
                Search
            </button>
        </form>
    );
}

export default SearchBar;
