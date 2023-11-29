import * as React from "react";
import StaffVisualizer from "../components/StaffVisualizer";
import PianoRollVisualizer from "../components/PianoRollVisualizer";
import * as mm from "@magenta/music";
import { noteSequenceToMusicXML, getNote } from "../noteSequenceToMusicXML";
import { TWINKLE_TWINKLE, ANNA_MAGDALENA_BACH } from "../SampleNoteSequences";

const TestPage = () => {
    const noteSequence = ANNA_MAGDALENA_BACH;

    return (
        <>
            <PianoRollVisualizer noteSequence={noteSequence}></PianoRollVisualizer>
            <StaffVisualizer noteSequence={noteSequence}></StaffVisualizer>

            <button
                onClick={() => {
                    const musicXML = noteSequenceToMusicXML(noteSequence); // Your MusicXML string here
                    const blob = new Blob([musicXML], { type: "application/octet-stream" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "music.xml";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }}
            >
                Download MusicXML
            </button>

            <button
                onClick={() => {
                    const midiData = mm.sequenceProtoToMidi(noteSequence);
                    const blob = new Blob([midiData], { type: "application/octet-stream" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "music.midi";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }}
            >
                Download MIDI
            </button>
        </>
    );
};

export default TestPage;

export const Head = () => <title>Test Page</title>;
