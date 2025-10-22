
"use client";

import { useMusic } from "@/hooks/use-music";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Search, Settings } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { SearchResults } from "./SearchResults";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useUser } from "@/firebase/auth/use-user";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const { searchTerm, setSearchTerm, setActiveView } = useMusic();
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { data: user } = useUser();
  const auth = useAuth();
  const router = useRouter();


  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowResults(false);
      setActiveView({ type: "search" });
    } else {
      setActiveView({ type: "all" });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(!!value.trim());
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }


  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="lg:hidden" />
      <div className="relative flex-auto" ref={searchContainerRef}>
        <form className="flex items-center gap-2" onSubmit={handleSearch}>
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for tracks, artists, albums..."
            className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => !!searchTerm.trim() && setShowResults(true)}
            maxLength={100}
          />
        </form>
        {showResults && <SearchResults searchTerm={searchTerm} closeResults={() => setShowResults(false)} />}
      </div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'}/>
                      <AvatarFallback>{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                  </Avatar>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveView({ type: 'settings' })}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
