import * as mm from "@magenta/music";
import { DEFAULT_KEY_SIGNATURE, DEFAULT_TEMPO, DEFAULT_TIME_SIGNATURE, NoteInfo, StaffInfo, TimeSignatureInfo, getBarLength } from "./staff_info";
import { SEQUENCE_KEY_TO_FIFTHS } from "./constants";

export function noteSequenceToMusicXML(noteSequence: mm.INoteSequence): string {
    let staffInfo = getStaffInfo(noteSequence);

    for (let note of staffInfo.notes) {

    }
}

/** Gets measure number at division */
function getMeasure(division: number, timeSignatures: TimeSignatureInfo[]): number {
    let currMeasure = 0;
    for (let [i, timeSignature] of timeSignatures.entries()) {
        let measureLength = 256 * getBarLength(timeSignature);
        let measuresAtTimeSignature;
        if (i == timeSignatures.length - 1) measuresAtTimeSignature = (division - timeSignature.start) / measureLength; // This is the last measure
        else measuresAtTimeSignature = (timeSignatures[i + 1].start - timeSignature.start) / measureLength; // There are other time signature changes

        currMeasure += measuresAtTimeSignature;
    }

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
function getStaffInfo(sequence: mm.INoteSequence): StaffInfo {
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