import { quantizeNoteSequence } from "@magenta/music/esm/core/sequences";
import * as mm from "@magenta/music/esm";

const NOTE_TYPES = {
    1: "1024th",
    2: "512th",
    4: "256th",
    8: "128th",
    16: "64th",
    32: "32th",
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
    let notes = new mm.NoteSequence(noteSequence);
    if (!notes.tempos[0].qpm) notes = quantizeNoteSequence(noteSequence);

    const SMALLEST_NOTE_LENGTH_SECONDS = 60 / (notes.tempos[0].qpm * 256);

    // Start of the XML document
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

    // Prep notes for MusicXML conversion
    let fixedNotes = notes.notes.slice().map((note) => ({
        pitch: note.pitch,
        startTime: note.startTime,
        endTime: note.endTime,
        duration: Math.round((note.endTime - note.startTime) / SMALLEST_NOTE_LENGTH_SECONDS),
        noteType: NOTE_TYPES[Math.round((note.endTime - note.startTime) / SMALLEST_NOTE_LENGTH_SECONDS)],
        tied: null,
    }));

    fixedNotes.sort((a, b) => {
        if (a.startTime === b.startTime) {
            return a.endTime - b.endTime;
        }
        return a.startTime - b.startTime;
    });

    let newFixedNotes = [];
    for (let i = 0; i < fixedNotes.length; i++) {
        // This breaks down notes with bad durations so they can be tied
        newFixedNotes.push(fixedNotes[i]);

        // while this not does not have a note type
        while (!newFixedNotes[newFixedNotes.length - 1].noteType) {
            // find the biggest note type that will fit
            //     newFixedNotes[i].tied = `<notations>
            // 	<tied type="start"/>
            //  </notations>`;
            for (let noteLength of Object.keys(NOTE_TYPES).sort((a, b) => b - a)) {
                if (newFixedNotes[newFixedNotes.length - 1].duration > noteLength) {
                    newFixedNotes[newFixedNotes.length - 1].noteType = NOTE_TYPES[noteLength]; // for now we are just using the closest note that will fit need to implement note tieing
                    //             // Adding a new adjusted note
                    //             let thisIndex = newFixedNotes.length - 1;
                    //             let nextIndex = thisIndex + 1;
                    //             newFixedNotes.push(newFixedNotes[thisIndex]);
                    //             newFixedNotes[nextIndex].duration = newFixedNotes[thisIndex].duration - noteLength;
                    //             newFixedNotes[nextIndex].startTime += noteLength * SMALLEST_NOTE_LENGTH_SECONDS;
                    //             newFixedNotes[nextIndex].noteType = NOTE_TYPES[newFixedNotes[thisIndex].duration];
                    //             newFixedNotes[nextIndex].tied = `<notations>
                    // 	<tied type="let-ring"/>
                    //  </notations>`;

                    //             // Fixing current note
                    //             newFixedNotes[thisIndex].duration = noteLength;
                    //             newFixedNotes[thisIndex].endTime -= noteLength * SMALLEST_NOTE_LENGTH_SECONDS;
                    //             newFixedNotes[thisIndex].noteType = NOTE_TYPES[newFixedNotes[thisIndex].duration];

                    break;
                }
            }

            //     if (newFixedNotes[newFixedNotes.length - 1].noteType) {
            //         newFixedNotes[newFixedNotes.length - 1].tied = `<notations>
            // 		<tied type="stop"/>
            //  </notations>`;
            //     }
        }
    }

    newFixedNotes.sort((a, b) => {
        if (a.startTime === b.startTime) {
            return a.endTime - b.endTime;
        }
        return a.startTime - b.startTime;
    });

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

    // Convert each note to MusicXML
    let divisions = 0;
    for (let [i, note] of newFixedNotes.entries()) {
        // divisions += note.duration;
        // if (divisions % (256 * 3) === 0) {
        //     if (divisions % (256 * 3) === 0) {
        //         musicXML += `
        // 		</measure>`;
        //     }

        //     musicXML += `
        // 		<measure number="${Math.floor(divisions / (256 * 3)) + 1}">
        // 		<print new-system="yes"/>
        // 		`;
        // }

        musicXML += `
			<note>
				${i > 0 ? (newFixedNotes[i - 1].startTime === note.startTime ? "<chord />" : "") : ""}
				<pitch>
					  <step>${getNote(note.pitch).step}</step>
					<alter>${getNote(note.pitch).alter}</alter>
					  <octave>${getNote(note.pitch).octave}</octave>
				</pitch>
				<duration>${note.duration}</duration>
				<type>${note.noteType}</type>
				${note.tied ? note.tied : ""}
			</note>
			`;
    }

    musicXML += `
				</measure>`;

    // End of the XML document
    musicXML += `
		</part>
	</score-partwise>`;

    return musicXML;
}

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
