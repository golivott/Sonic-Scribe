import * as mm from "@magenta/music";
import { DEFAULT_KEY_SIGNATURE, DEFAULT_TEMPO, DEFAULT_TIME_SIGNATURE, NoteInfo, StaffInfo, TimeSignatureInfo, getBarLength } from "./staff_info";
import { SEQUENCE_KEY_TO_FIFTHS } from "./constants";

export function noteSequenceToMusicXML(noteSequence: mm.INoteSequence) {
    let staffInfo = getStaffInfo(noteSequence);

    for (let note of staffInfo.notes) {

    }
}

/** Gets measure number at division */
export function getMeasure(division: number, timeSignatures: TimeSignatureInfo[]): number {
    let currMeasure = 0;
    let currDivison = 0;
    let i = 0;
    while (i < timeSignatures.length - 1) {
        // Calculate how many measures occur at this time sig
        let measureLength = 256 * getBarLength(timeSignatures[i]);
        let measuresAtTimeSignature = (timeSignatures[i + 1].start - timeSignatures[i].start) / measureLength;
        // Check if we have passed the division we are trying to find
        if(currDivison + measuresAtTimeSignature * measureLength > division) break; 

        currMeasure += measuresAtTimeSignature;
        currDivison += measuresAtTimeSignature * measureLength;
        
        i++;
    }

    let measureLength = 256 * getBarLength(timeSignatures[i]);
    currMeasure += (division - timeSignatures[i].start) / measureLength;
    console.log(currMeasure)

    return Math.floor(currMeasure) + 1;
}

// TODO: implement support for tempo changes
function timeToDivisions(time: number, tempo: number = 120): number {
    const t = (time * tempo) / 60;
    return Math.ceil(t * 256); // min resolution = 1/256 quarter
}

/** Converts a note sequence note to a note info */
function getNoteInfo(note: mm.NoteSequence.INote): NoteInfo {
    const startT = timeToDivisions(note.startTime);
    const endT = timeToDivisions(note.endTime);
    return {
        start: startT,
        length: endT - startT,
        pitch: note.pitch,
        velocity: note.velocity
    };
}

/** Converts a note sequence to a staff info */
export function getStaffInfo(sequence: mm.INoteSequence): StaffInfo {
    const notesInfo = [];
    for (let note of sequence.notes) {
        notesInfo.push(getNoteInfo(note));
    }

    return {
        notes: notesInfo,
        tempos: sequence.tempos
            ? sequence.tempos.map((t) => {
                return { start: timeToDivisions(t.time), qpm: t.qpm };
            })
            : [DEFAULT_TEMPO],
        keySignatures: sequence.keySignatures
            ? sequence.keySignatures.map((ks) => {
                return { start: timeToDivisions(ks.time), key: SEQUENCE_KEY_TO_FIFTHS[ks.key] };
            })
            : [DEFAULT_KEY_SIGNATURE],
        timeSignatures: sequence.timeSignatures
            ? sequence.timeSignatures.map((ts) => {
                return {
                    start: timeToDivisions(ts.time),
                    numerator: ts.numerator,
                    denominator: ts.denominator,
                };
            })
            : [DEFAULT_TIME_SIGNATURE],
    };
}