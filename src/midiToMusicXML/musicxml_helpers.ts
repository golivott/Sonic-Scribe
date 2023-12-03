import { KeySignatureInfo, TimeSignatureInfo } from "./staff_info"

/**
 * @returns MusicXML doc header
 */
export function getHeader(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
    <part-list>
        <score-part id="P1">
            <part-name>Music</part-name>
        </score-part>
    </part-list>
    <part id="P1">`
}

/** Builds a measure opening element
 *  @param measureNumber
 *  @param key If null will default to C
 *  @param timeSignature If null will default to 4/4
 *  @returns Measure opening element
 */
export function getMeasureOpen(measureNumber: number, key: KeySignatureInfo = null, timeSignature: TimeSignatureInfo = null): string {
    return `
        <measure number="${measureNumber}">
        ${!key && !timeSignature ? "" : `<attributes>
            <divisions>256</divisions>
            <key>
                <fifths>${key.key || 0}</fifths>
            </key>
            <time>
        <beats>${timeSignature.numerator || 4}</beats>
        <beat-type>${timeSignature.denominator || 4}</beat-type>
        </time>
            <staves>2</staves>
            <clef number="1">
                <sign>G</sign>
                <line>2</line>
            </clef>
            <clef number="2">
                <sign>F</sign>
                <line>4</line>
            </clef>
        </attributes>`}
        `
}

export function getNote(): string {
    // return `
    //         <note>
    //             ${i > 0 ? (notesWithTies[i - 1].startTime === note.startTime ? "<chord />" : "") : ""}
    //             <pitch>
    //                     <step>${getNote(note.pitch).step}</step>
    //                     <alter>${getNote(note.pitch).alter}</alter>
    //                     <octave>${getNote(note.pitch).octave}</octave>
    //             </pitch>
    //             <duration>${note.endTime - note.startTime}</duration>
    //             <type>${note.noteType}</type>
    //             ${note.dot ? "<dot />" : ""}
    //             <notations>
    //                 ${note.notations.reduce((acc, currVal) => {
    //     return acc + currVal + "\n";
    // }, "")}
    // 			</notations>
    //         </note>`
}