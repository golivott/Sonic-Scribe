import { OnsetsAndFrames } from "@magenta/music/esm/transcription";
import { openDB } from "idb";

let model;
let modelReady = false; // Use this bool to check if the model is ready

// Downloads model
export async function initOnsetsAndFrames() {
    if (modelReady) return true; // If the model is loaded return true

    // Create a storage location for this model
    const db = await openDB("my-database", 1, {
        upgrade(db) {
            db.createObjectStore("models");
        },
    });

    // Try to retrieve the model from the user cache
    model = await db.get("models", "onsetsAndFrames");

    // If the user doesn't have the model download it
    if (!model) {
        console.log("Downloading Model ...");
        model = new OnsetsAndFrames(
            "https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni"
        );

        await model.initialize();
        await db.put("models", model, "onsetsAndFrames");
    } else {
        console.log("Found model in indexedDB!");
    }

    modelReady = true;
    return true;
}

// Transcribes audio file to a note sequence
export async function transcribeFromAudioFile(file) {
    // Create a Blob from the file
    const blob = await createBlob(file);

    // Ensure the model is ready before transcribing
    if (!modelReady) {
        await initOnsetsAndFrames();
    }

    // Transcribe the audio file
    const noteSequence = await model.transcribeFromAudioFile(blob);
    console.log(noteSequence);

    return noteSequence;
}

// Create a blob from the file
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
