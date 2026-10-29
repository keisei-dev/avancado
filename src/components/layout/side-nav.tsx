"use client";

// UI library (P2): SideNav
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Desktop left menu: Home, Community, Sitter board, Map, My pets.
 * Active item; collapses to icons with tooltips at ≤1240px; footer links
 * (Terms, Safety, Privacy). Hidden at ≤900px. Needs "use client" (usePathname).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UsersRound,
  Dog,
  MapPin,
  PawPrint,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

export type UserPage = "home" | "sitters" | "community" | "map" | "pets" | "profile" | "publicProfile" | "messages" | "terms" | "safety" | "privacy";


export function SideNav() {
    const items: { id: UserPage; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "community", label: "Community", icon: UsersRound },
    { id: "sitters", label: "Sitter board", icon: Dog },
    { id: "map", label: "Pet-friendly map", icon: MapPin },
    { id: "pets", label: "My pets", icon: PawPrint },
    ];

    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md">
            
            <div className="flex items-center justify-center p-4">
                <BrandLogo />
            </div>
            <ul className="flex flex-col mt-8">
                {items.map((item) => (
                    <li key={item.id} className="mb-4">
                        <Link
                            href={`/${item.id}`}
                            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-[var(--cream)] ${
                                pathname === `/${item.id}` ? "bg-gray-200" : ""
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-2" />
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export {};



