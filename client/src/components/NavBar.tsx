import { NavLink } from "react-router-dom";

const links = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/players", label: "Players" },
    { to: "/matches", label: "Matches" },
    { to: "/meta", label: "Meta" },
];

function NavBar() {
    return (
        <nav className="flex gap-4 overflow-x-auto border-b border-zinc-800 px-4 py-4 sm:gap-6 sm:px-6">
            {links.map(({ to, label, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        isActive
                            ? "text-sm font-medium text-violet-400"
                            : "text-sm font-medium text-zinc-400 hover:text-zinc-100"
                    }
                >
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}

export default NavBar;
