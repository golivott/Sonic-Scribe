import * as mm from "@magenta/music/esm";
import { quantizeNoteSequence } from "@magenta/music/esm/core/sequences";
import { TWINKLE_TWINKLE_2 } from "./SampleNoteSequences";
import * as _ from "lodash";

const NOTE_TYPES = {
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

export function noteSequenceToMusicXML(noteSequence) {
    // Ensure sequence is quantized
    if (!noteSequence.isQuantizedSequence) noteSequence = quantizeNoteSequence(noteSequence);

    function timeToQuarters(time) {
        const q = time * noteSequence.tempos[0].qpm / 60;
        return Math.round(q * 16) / 16; // min resolution = 1/16 quarter
    }

    function getNoteInfo(note) {
        const startQ = timeToQuarters(note.startTime);
        const endQ = timeToQuarters(note.endTime);
        return {
            start: startQ,
            length: endQ - startQ,
            pitch: note.pitch,
            intensity: note.velocity
        };
    }

    function getScoreInfo() {
        const notesInfo = [];
        sequence.notes.forEach((note) => {
            if (this.isNoteInInstruments(note)) {
                notesInfo.push(getNoteInfo(note));
            }
        });
        return {
            notes: notesInfo,
            tempos: sequence.tempos ?
                sequence.tempos.map((t) => {
                    return { start: this.timeToQuarters(t.time), qpm: t.qpm };
                }) :
                [],
            keySignatures: sequence.keySignatures ?
                sequence.keySignatures.map((ks) => {
                    return { start: this.timeToQuarters(ks.time), key: ks.key };
                }) :
                [],
            timeSignatures: sequence.timeSignatures ?
                sequence.timeSignatures.map((ts) => {
                    return {
                        start: this.timeToQuarters(ts.time),
                        numerator: ts.numerator,
                        denominator: ts.denominator
                    };
                }) :
                []
        };
    }
}




export function noteSequenceToMusicXML(noteSequence) {
    let noteSeq = new mm.NoteSequence(noteSequence || TWINKLE_TWINKLE_2);

    let tempo = noteSeq.tempos[0] ? noteSeq.tempos[0].qpm : 120;
    const SMALLEST_NOTE_LENGTH_SECONDS = 60 / (tempo * 256);

    // get notes ready for MusicXML conversion and change time scale
    let notes = noteSeq.notes.slice().map((note) => ({
        pitch: note.pitch,
        startTime: Math.ceil(note.startTime / SMALLEST_NOTE_LENGTH_SECONDS),
        endTime: Math.ceil(note.endTime / SMALLEST_NOTE_LENGTH_SECONDS),
        noteType: null,
        dot: false,
        notations: [],
    }));

    // Sort notes by start time and end time
    notes.sort((a, b) => {
        if (a.startTime === b.startTime) {
            return a.endTime - b.endTime;
        }
        return a.startTime - b.startTime;
    });

    console.log(notes);

    // Tieing notes
    let notesWithTies = [];
    for (let i = 0; i < notes.length; i++) {
        let note = _.cloneDeep(notes[i]);
        notesWithTies.push(note);

        let noteDuration = note.endTime - note.startTime;
        // Find all overlapping notes
        let overlapingNotes = notes.filter(
            (n, j) =>
                i !== j &&
                n.startTime > note.startTime &&
                n.startTime < note.startTime + noteDuration &&
                n.pitch !== note.pitch
        );

        // This will prevent us from creating duplicate ties at the same start time
        let seenStartTimes = new Set();
        overlapingNotes = overlapingNotes.filter((note) => {
            if (seenStartTimes.has(note.startTime)) {
                return false;
            } else {
                seenStartTimes.add(note.startTime);
                return true;
            }
        });

        console.log(note);
        console.log(overlapingNotes);

        // If this note needs ties
        if (overlapingNotes.length > 0) {
            notesWithTies[notesWithTies.length - 1].notations = [`<tied type="start"/>`];
            notesWithTies[notesWithTies.length - 1].endTime = overlapingNotes[0].startTime; // this note ends when the next note begins

            let tiedNotes = [];
            for (let [j, overlapedNote] of overlapingNotes.entries()) {
                let tiedNote = _.cloneDeep(notes[i]); // clone of the original note, this copy wil be used to create the tie
                tiedNotes.push(tiedNote); // push a copy of this note

                tiedNotes[tiedNotes.length - 1].startTime = overlapedNote.startTime;

                // end time is equal to the next overlaping notes start if there is one
                if (j + 1 < overlapingNotes.length) {
                    tiedNotes[tiedNotes.length - 1].endTime = overlapingNotes[j + 1].startTime;
                }

                // If this isn't the last note in the tie stop and restart the tie
                if (tiedNotes.length < overlapingNotes.length) {
                    tiedNotes[tiedNotes.length - 1].notations = [`<tied type="stop"/>`, `<tied type="start"/>`];
                }
                // Else this is the last note stop the tie
                else {
                    tiedNotes[tiedNotes.length - 1].notations = [`<tied type="stop"/>`];
                }
            }

            notesWithTies = notesWithTies.concat(tiedNotes);
        }
    }

    console.log(notesWithTies);

    // Classify notes
    for (let i = 0; i < notesWithTies.length; i++) {
        let noteType = findClosestNoteType(notesWithTies[i]);
        notesWithTies[i].noteType = noteType.noteType;
        notesWithTies[i].dot = noteType.isDotted;
    }

    // Sort notes by start time and end time we we use this to check if the note is a chord
    notesWithTies.sort((a, b) => {
        if (a.startTime === b.startTime) {
            return a.endTime - b.endTime;
        }
        return a.startTime - b.startTime;
    });

    // Build musicXML file
    // Header
    let musicXML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
    <part-list>
        <score-part id="P1">
            <part-name>Music</part-name>
        </score-part>
    </part-list>
    <part id="P1">
		  	`;

    // First measure
    musicXML += `
        <measure number="1">
        <attributes>
            <divisions>256</divisions>
            <key>
                <fifths>0</fifths>
            </key>
            <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
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
        </attributes>`;

    // Adding notes
    for (let [i, note] of notesWithTies.entries()) {
        musicXML += `
            <note>
                ${i > 0 ? (notesWithTies[i - 1].startTime === note.startTime ? "<chord />" : "") : ""}
                <pitch>
                        <step>${getNote(note.pitch).step}</step>
                        <alter>${getNote(note.pitch).alter}</alter>
                        <octave>${getNote(note.pitch).octave}</octave>
                </pitch>
                <duration>${note.endTime - note.startTime}</duration>
                <type>${note.noteType}</type>
                ${note.dot ? "<dot />" : ""}
                <notations>
                    ${note.notations.reduce((acc, currVal) => {
            return acc + currVal + "\n";
        }, "")}
				</notations>
            </note>`;
    }

    // End of the XML document
    musicXML += `
        </measure>
	</part>
</score-partwise>`;

    return musicXML;
}

function findClosestNoteType(note) {
    let noteDuration = note.endTime - note.startTime;
    let closestNoteType = null;
    let smallestDifference = Infinity;
    let isDotted = false;

    // Loop through all note durations
    for (let noteLength of Object.keys(NOTE_TYPES)) {
        let noteLengthNumber = Number(noteLength);
        let regularDifference = Math.abs(noteDuration - noteLengthNumber);
        let dottedDifference = Math.abs(noteDuration - noteLengthNumber * 1.5);

        // Check if the note duration is closer to the dotted note length
        if (dottedDifference < regularDifference && dottedDifference < smallestDifference) {
            smallestDifference = dottedDifference;
            closestNoteType = NOTE_TYPES[noteLength];
            isDotted = true;
        } else if (regularDifference < smallestDifference) {
            smallestDifference = regularDifference;
            closestNoteType = NOTE_TYPES[noteLength];
            isDotted = false;
        }
    }

    return { noteType: closestNoteType, isDotted: isDotted };
}

// export function noteSequenceToMusicXML(noteSequence) {
//     let notes = new mm.NoteSequence(noteSequence);
//     let tempo = notes.tempos[0] ? notes.tempos[0].qpm : 120;

//     const SMALLEST_NOTE_LENGTH_SECONDS = 60 / (tempo * 256);

//     // Prep notes for MusicXML conversion
//     let fixedNotes = notes.notes.slice().map((note) => ({
//         pitch: note.pitch,
//         startTime: note.startTime,
//         endTime: note.endTime,
//         duration: Math.round((note.endTime - note.startTime) / SMALLEST_NOTE_LENGTH_SECONDS),
//         noteType: NOTE_TYPES[Math.round((note.endTime - note.startTime) / SMALLEST_NOTE_LENGTH_SECONDS)],
//         tied: null,
//     }));

//     fixedNotes.sort((a, b) => {
//         if (a.startTime === b.startTime) {
//             return a.endTime - b.endTime;
//         }
//         return a.startTime - b.startTime;
//     });

//     console.log(fixedNotes);

//     let newFixedNotes = [];
//     for (let i = 0; i < fixedNotes.length; i++) {
//         // This breaks down notes with bad durations so they can be tied
//         newFixedNotes.push(fixedNotes[i]);

//         // while this not does not have a note type
//         while (!newFixedNotes[newFixedNotes.length - 1].noteType) {
//             // find the biggest note type that will fit
//             //     newFixedNotes[i].tied = `<notations>
//             // 	<tied type="start"/>
//             //  </notations>`;
//             for (let noteLength of Object.keys(NOTE_TYPES).sort((a, b) => b - a)) {
//                 if (newFixedNotes[newFixedNotes.length - 1].duration > noteLength) {
//                     newFixedNotes[newFixedNotes.length - 1].noteType = NOTE_TYPES[noteLength]; // for now we are just using the closest note that will fit need to implement note tieing
//                     //             // Adding a new adjusted note
//                     //             let thisIndex = newFixedNotes.length - 1;
//                     //             let nextIndex = thisIndex + 1;
//                     //             newFixedNotes.push(newFixedNotes[thisIndex]);
//                     //             newFixedNotes[nextIndex].duration = newFixedNotes[thisIndex].duration - noteLength;
//                     //             newFixedNotes[nextIndex].startTime += noteLength * SMALLEST_NOTE_LENGTH_SECONDS;
//                     //             newFixedNotes[nextIndex].noteType = NOTE_TYPES[newFixedNotes[thisIndex].duration];
//                     //             newFixedNotes[nextIndex].tied = `<notations>
//                     // 	<tied type="let-ring"/>
//                     //  </notations>`;

//                     //             // Fixing current note
//                     //             newFixedNotes[thisIndex].duration = noteLength;
//                     //             newFixedNotes[thisIndex].endTime -= noteLength * SMALLEST_NOTE_LENGTH_SECONDS;
//                     //             newFixedNotes[thisIndex].noteType = NOTE_TYPES[newFixedNotes[thisIndex].duration];

//                     break;
//                 }
//             }

//             //     if (newFixedNotes[newFixedNotes.length - 1].noteType) {
//             //         newFixedNotes[newFixedNotes.length - 1].tied = `<notations>
//             // 		<tied type="stop"/>
//             //  </notations>`;
//             //     }
//         }
//     }

//     newFixedNotes.sort((a, b) => {
//         if (a.startTime === b.startTime) {
//             return a.endTime - b.endTime;
//         }
//         return a.startTime - b.startTime;
//     });

//     // Start of the XML document
//     let musicXML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
// 	<!DOCTYPE score-partwise PUBLIC
// 		"-//Recordare//DTD MusicXML 4.0 Partwise//EN"
// 		"http://www.musicxml.org/dtds/partwise.dtd">
// 	<score-partwise version="4.0">
// 	  	<part-list>
// 			<score-part id="P1">
// 		  		<part-name>Music</part-name>
// 			</score-part>
// 	  	</part-list>
// 	  	<part id="P1">
// 		  	`;

//     musicXML += `
// 				<measure number="1">
// 				<attributes>
// 					<divisions>256</divisions>
// 					<key>
// 					  <fifths>0</fifths>
// 					</key>
// 					<staves>2</staves>
// 				  <clef number="1">
// 						<sign>G</sign>
// 						<line>2</line>
// 				  </clef>
// 				  <clef number="2">
// 						<sign>F</sign>
// 						<line>4</line>
// 				  </clef>
// 			  </attributes>`;

//     // Convert each note to MusicXML
//     let divisions = 0;
//     for (let [i, note] of newFixedNotes.entries()) {
//         // divisions += note.duration;
//         // if (divisions % (256 * 3) === 0) {
//         //     if (divisions % (256 * 3) === 0) {
//         //         musicXML += `
//         // 		</measure>`;
//         //     }

//         //     musicXML += `
//         // 		<measure number="${Math.floor(divisions / (256 * 3)) + 1}">
//         // 		<print new-system="yes"/>
//         // 		`;
//         // }

//         musicXML += `
// 			<note>
// 				${i > 0 ? (newFixedNotes[i - 1].startTime === note.startTime ? "<chord />" : "") : ""}
// 				<pitch>
// 					    <step>${getNote(note.pitch).step}</step>
// 					    <alter>${getNote(note.pitch).alter}</alter>
// 					    <octave>${getNote(note.pitch).octave}</octave>
// 				</pitch>
// 				<duration>${note.duration}</duration>
// 				<type>${note.noteType}</type>
// 				${note.tied ? note.tied : ""}
// 			</note>
// 			`;
//     }

//     musicXML += `
// 				</measure>`;

//     // End of the XML document
//     musicXML += `
// 		</part>
// 	</score-partwise>`;

//     return musicXML;
// }

// This only uses sharps and only works for C Major fix later
function getNote(midiPitch) {
    const notes = {
        0: "A", // A
        1: "A", // A#
        2: "B", // B
        3: "C", // C
        4: "C", // C#
        5: "D", // D
        6: "D", // D#
        7: "E", // E
        8: "F", // F
        9: "F", // F#
        10: "G", // G
        11: "G", // G#
    };

    const alters = {
        0: 0, // A
        1: 1, // A#
        2: 0, // B
        3: 0, // C
        4: 1, // C#
        5: 0, // D
        6: 1, // D#
        7: 0, // E
        8: 0, // F
        9: 1, // F#
        10: 0, // G
        11: 1, // G#
    };

    return {
        step: notes[(midiPitch - 21) % 12],
        alter: alters[(midiPitch - 21) % 12],
        octave: Math.floor((midiPitch - 12) / 12),
    };
}
