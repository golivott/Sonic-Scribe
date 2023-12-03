/** Convert divisions to note types */
const DIVISIONS_TO_NOTE_TYPE = {
    1: "1024th",
    2: "512th",
    4: "256th",
    8: "128th",
    16: "64th",
    32: "32nd",
    64: "16th",
    128: "eighth",
    256: "quarter",
    512: "half",
    1024: "whole",
    2048: "breve",
    4096: "long",
    8192: "maxima",
};


/** Convert mm.NoteSequence keys to musicXML fifths */
export const SEQUENCE_KEY_TO_FIFTHS = {
    0: 0,   // C
    1: -5,   // C#/Db
    2: 2,   // D
    3: -3,  // D#/Eb
    4: 4,   // E
    5: -1,  // F
    6: 6,   // F#/Gb
    7: 1,   // G
    8: -4,  // G#/Ab
    9: 3,   // A
    10: -2, // A#/Bb
    11: 5,  // B
}