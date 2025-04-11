import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold gradient-text">
              Fund The Future Now
            </h3>
            <p className="text-sm text-muted-foreground">
              A decentralized crowdfunding platform powered by blockchain
              technology.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Discover Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Start a Campaign
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blockchain-101"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Blockchain 101
                </Link>
              </li>
              <li>
                <a
                  href="https://discord.gg/fundthefuture"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fund The Future Now. All rights
            reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://twitter.com/fundthefuture"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Twitter
            </a>
            <a
              href="https://github.com/fundthefuture"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="https://discord.gg/fundthefuture"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
