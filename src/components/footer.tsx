"use client"

import { useUserContext } from "@/context/user-context";

export function Footer() {
    const { uniqueVisitors } = useUserContext();

    return (
        <footer className="bg-card border-t">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <p>Designed by Ritesh Kumar</p>
                    <p>Unique Visitors: {uniqueVisitors}</p>
                </div>
            </div>
        </footer>
    )
}
