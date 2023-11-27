import { quantizeNoteSequence } from "@magenta/music/esm/core/sequences";
import React from "react";
import { useEffect, useRef } from "react";
const mm = require("@magenta/music");

export default function StaffVisualizer() {
    const visualizerRef = useRef(null);
    const debugRef = useRef(null);

    useEffect(() => {
        let TWINKLE_TWINKLE = new mm.NoteSequence({
            notes: [
                { pitch: 60, startTime: 0.0, endTime: 0.5 },
                { pitch: 60, startTime: 0.5, endTime: 1.0 },
                { pitch: 67, startTime: 1.0, endTime: 1.5 },
                { pitch: 67, startTime: 1.5, endTime: 2.0 },
                { pitch: 69, startTime: 2.0, endTime: 2.5 },
                { pitch: 69, startTime: 2.5, endTime: 3.0 },
                { pitch: 67, startTime: 3.0, endTime: 4.0 },
                { pitch: 65, startTime: 4.0, endTime: 4.5 },
                { pitch: 65, startTime: 4.5, endTime: 5.0 },
                { pitch: 64, startTime: 5.0, endTime: 5.5 },
                { pitch: 64, startTime: 5.5, endTime: 6.0 },
                { pitch: 62, startTime: 6.0, endTime: 6.5 },
                { pitch: 62, startTime: 6.5, endTime: 7.0 },
                { pitch: 60, startTime: 7.0, endTime: 8.0 },
            ],
            totalTime: 8,
        });

        TWINKLE_TWINKLE = quantizeNoteSequence(TWINKLE_TWINKLE, 4);

        const visualizer = new mm.StaffSVGVisualizer(TWINKLE_TWINKLE, visualizerRef.current);
        visualizer.redraw();
    }, []);

    return (
        <div ref={visualizerRef}>
            <p ref={debugRef}></p>
        </div>
    );
}
