"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const connectWallet = () => {
    // This would be replaced with actual wallet connection logic
    setIsWalletConnected(true);
    console.log("Connecting wallet...");
  };

  const navigation = [
    { name: "Discover", href: "/discover" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Create", href: "/create" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">FundX</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>

          {isWalletConnected ? (
            <Button variant="outline" className="hidden md:inline-flex">
              <Wallet className="mr-2 h-4 w-4" />
              0x123...abc
            </Button>
          ) : (
            <Button
              onClick={connectWallet}
              className="hidden md:inline-flex gradient-bg"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 px-3 text-base font-medium rounded-md ${
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/search"
              className="flex items-center py-2 px-3 text-base font-medium rounded-md text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Link>
            {!isWalletConnected && (
              <Button
                onClick={() => {
                  connectWallet();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-2 gradient-bg"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
