import React from "react";
import { useEffect, useRef } from "react";
import { quantizeNoteSequence } from "@magenta/music/esm/core/sequences";
import * as mm from "@magenta/music";

export default function PianoRollVisualizer({ visualizerType, noteSequence }) {
    const visualizerRef = useRef(null);

    useEffect(() => {
        if (noteSequence) {
            let notes = noteSequence;
            if (!notes.quantizationInfo) notes = quantizeNoteSequence(noteSequence);

            const visualizer = new mm.PianoRollCanvasVisualizer(notes, visualizerRef.current);
            visualizer.redraw();
        }
    }, [noteSequence]);

    return <canvas ref={visualizerRef} />;
}
