// UI library (P2): SideNav
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Desktop left menu: Home, Community, Sitter board, Map, My pets.
 * Active item; collapses to icons with tooltips at ≤1240px; footer links
 * (Terms, Safety, Privacy). Hidden at ≤900px. Needs "use client" (usePathname).
 */

import { usePathname } from "next/navigation";
import {
  Home, UsersRound, UserRound, MapPin, PawPrint
} from "lucide-react";

function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="side-nav">
      <ul>
        <li className={pathname === "/" ? "active" : ""}>
          <a href="/">
            <Home />
            Home
          </a>
        </li>
        <li className={pathname === "/community" ? "active" : ""}>
          <a href="/community">
            <UsersRound />
            Community
          </a>
        </li>
        <li className={pathname === "/sitter-board" ? "active" : ""}>
          <a href="/sitter-board">
            <UserRound />
            Sitter Board
          </a>
        </li>
        <li className={pathname === "/map" ? "active" : ""}>
          <a href="/map">
            <MapPin />
            Map
          </a>
        </li>
        <li className={pathname === "/my-pets" ? "active" : ""}>
          <a href="/my-pets">
            <PawPrint />
            My Pets
          </a>
        </li>
      </ul>
    </nav>
  );
}

export { SideNav };



