import { OnsetsAndFrames } from "@magenta/music/esm/transcription";

let model;
export let modelReady = false;

export function initOnsetsAndFrames() {
    model = new OnsetsAndFrames(
        "https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni"
    );

    model.initialize().then(() => {
        modelReady = true;
    });
}

export async function transcribeFromAudioFile(file) {
    // Create a Blob from the file
    const blob = await createBlob(file);

    // Ensure the model is ready before transcribing
    if (!modelReady) {
        await initOnsetsAndFrames();
    }

    // Transcribe the audio file
    const noteSequence = await transcribeFromAudioFile(blob);
    console.log(noteSequence);

    return noteSequence;
}

function createBlob(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const result = reader.result;
            const blob = new Blob([result], { type: file.type });
            resolve(blob);
        };

        reader.onerror = (event) => {
            reject(reader.error);
        };

        reader.readAsArrayBuffer(file);
    });
}
