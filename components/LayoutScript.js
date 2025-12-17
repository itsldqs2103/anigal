"use client"
import { useEffect } from "react";

export default function LayoutScript() {
    useEffect(() => {
        const preventDefault = (e) => {
            e.preventDefault();
        };

        document.addEventListener("dragstart", preventDefault);

        document.addEventListener("dragover", preventDefault);
        document.addEventListener("drop", preventDefault);

        return () => {
            document.removeEventListener("dragstart", preventDefault);
            document.removeEventListener("dragover", preventDefault);
            document.removeEventListener("drop", preventDefault);
        };
    }, []);

    return null;
}