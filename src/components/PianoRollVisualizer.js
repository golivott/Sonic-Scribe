import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { quantizeNoteSequence } from "@magenta/music/esm/core/sequences";
import * as mm from "@magenta/music";

export default function PianoRollVisualizer({ visualizerType, noteSequence }) {
    const visualizerRef = useRef(null);
    const [visualizer, setVisualizer] = useState(null);
    const player = new mm.Player(false, {
        run: (note) => visualizer.redraw(note),
    });

    useEffect(() => {
        if (noteSequence) {
            let notes = noteSequence;
            if (!notes.quantizationInfo) notes = quantizeNoteSequence(noteSequence);

            const visualizer = new mm.PianoRollCanvasVisualizer(notes, visualizerRef.current);
            setVisualizer(visualizer);
            visualizer.redraw();
        }
    }, [noteSequence]);

    return (
        <>
            <canvas ref={visualizerRef} />
            <button
                onClick={() => {
                    player.start(noteSequence);
                }}
            >
                PLAY
            </button>
            <button
                onClick={() => {
                    player.stop();
                }}
            >
                STOP
            </button>
        </>
    );
}
