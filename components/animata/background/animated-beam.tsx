"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

function Beam({ index }: { index: number }) {
    const flag = index % 8 === 0;
    const flag2 = index % 3 === 0; // Speed variation

    //Color classes
    const colorClasses = ["bg-green-500", "bg-red-500"];

    //Random color select
    const selectedColor = useMemo(() => {
        const idx = Math.floor(Math.random() * colorClasses.length);
        return colorClasses[idx];
    }, []);

    return (
        <div
            className={cn("h-full animate-meteor", {
                "[--duration:7s]": flag,
                "[--duration:11s]": !flag && !flag2,
                "[--duration:5s]": flag2,
            })}
            style={{
                width: "6px",
                transform: "translateY(-20%)",
                "--delay": `${index * 0.5}s`,
            } as React.CSSProperties & { [key: string]: string | number }}
        >
            <div
                style={{
                    clipPath: "polygon(54% 0, 54% 0, 75% 100%, 40% 100%)",
                }}
                className={cn("w-full", {
                    "h-8": flag,
                    "h-12": !flag,
                })}
            >
                {/* Apply the selected color */}
                <div className={`${selectedColor} h-full w-full`} />
            </div>
        </div>
    );
}

function useGridCount() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) {
                return;
            }
            const width = rect.width;
            const cellSize = 40;
            setCount(Math.ceil(width / cellSize) + 2); //Added 2 extra beams
        };

        updateCount();

        // Can be debounced if needed
        window.addEventListener("resize", updateCount);
        return () => window.removeEventListener("resize", updateCount);
    }, []);

    return {
        count,
        containerRef,
    };
}

function Background() {
    const { count, containerRef } = useGridCount();

    return (
        <div
            ref={containerRef}
            className="-z-1 absolute inset-0 flex h-full w-full flex-row justify-between bg-gradient-to-b from-blue-900 via-indigo-950 to-gray-950"
        >
            <div
                style={{
                    background:
                        "radial-gradient(50% 50% at 50% 50%,#072a39 0%,rgb(7,42,57) 50%,rgba(7,42,57,0) 100%)",
                }}
                className="absolute inset-0 top-1/2 h-full w-full rounded-full opacity-40"
            />
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="relative h-full w-px rotate-6 bg-gray-300 bg-opacity-10">
                    {(1 + i) % 4 === 0 && <Beam index={i + 1} />}
                </div>
            ))}
        </div>
    );
}

export default function AnimatedBeam({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("storybook-fix relative w-full overflow-hidden", className)}>
            <Background />
            <div className="relative h-full w-full">{children}</div>
        </div>
    );
}
