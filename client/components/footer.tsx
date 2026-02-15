import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl mt-24">
            <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="text-xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Forge Todo
                        </span>
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} Forge Todo. All rights reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Terms
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Privacy
                        </Link>
                        <Link href="https://github.com/vinay-vk-kumar" target="_blank" className="hover:text-foreground transition-colors">
                            GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
