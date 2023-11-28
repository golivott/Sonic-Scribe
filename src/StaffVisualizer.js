import { quantizeNoteSequence } from "@magenta/music/esm/core/sequences";
import React from "react";
import { useEffect, useRef } from "react";
import * as mm from "@magenta/music";

export default function StaffVisualizer({ noteSequence }) {
    const visualizerRef = useRef(null);

    useEffect(() => {
        if (noteSequence) {
            let notes = noteSequence;
            if (!notes.quantizationInfo) notes = quantizeNoteSequence(noteSequence, 4);

            const visualizer = new mm.StaffSVGVisualizer(notes, visualizerRef.current);
            visualizer.redraw();
        }
    }, [noteSequence]);

    return <div ref={visualizerRef}></div>;
}
