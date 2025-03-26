"use client"

import { ThemeSwitcher } from "./theme-switcher"
import { ExternalLink } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-4">
                    <a className="flex items-center space-x-2" href="/">
                        <h1 className="text-xl font-bold text-foreground">OpenStudio</h1>
                    </a>
                    <p className="text-sm text-muted-foreground">Segment Anything 2 Demo</p>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="flex items-center gap-6">
                        <a href="#" className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors">
                            About <ExternalLink className="w-4 h-4" />
                        </a>
                        <a href="#" className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors">
                            Dataset <ExternalLink className="w-4 h-4" />
                        </a>
                        <a href="#" className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors">
                            AI Demos <ExternalLink className="w-4 h-4" />
                        </a>
                    </nav>
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    )
}