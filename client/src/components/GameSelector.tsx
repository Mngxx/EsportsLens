import type { Game } from "../types";

interface GameSelectorProps {
    value: Game;
    onChange: (game: Game) => void;
}

const GAMES: { value: Game; label: string }[] = [
    { value: "dota2", label: "Dota 2" },
    { value: "lol", label: "League of Legends" },
];

function GameSelector({ value, onChange }: GameSelectorProps) {
    return (
        <div className="inline-flex rounded-lg border border-zinc-800 p-1">
            {GAMES.map((game) => (
                <button
                    key={game.value}
                    type="button"
                    onClick={() => onChange(game.value)}
                    className={
                        value === game.value
                            ? "rounded-md bg-violet-500/20 px-3 py-1.5 text-sm font-medium text-violet-300"
                            : "rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100"
                    }
                >
                    {game.label}
                </button>
            ))}
        </div>
    );
}

export default GameSelector;
