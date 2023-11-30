// src/components/UploadButtonComponent.js
import React, { useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";

const UploadButtonComponent = ({ onFileUpload }) => {
    const toast = useRef(null);
    let file = undefined;

    // const saveFileLocally = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();

    //         reader.onload = (event) => {
    //             const result = reader.result;
    //             const blob = new Blob([result], { type: file.type });
    //             let url = URL.createObjectURL(blob);
    //             resolve(url);
    //         };

    //         reader.onerror = (event) => {
    //             reject(reader.error);
    //         };

    //         reader.readAsArrayBuffer(file);
    //     });
    // };

    async function onSelect(event) {
        // event.files == files to upload
        file = event.files[0];
        console.log(file);

        // Uploads file so it can be used elsewhere
        if (onFileUpload) onFileUpload(file);

        // Save file locally if you need it in a url e.x. localhost:8000/{uuid}
        // url = await saveFileLocally(file);
        toast.current.show({ severity: "success", summary: "Success", detail: "Uploaded " + file.name, life: 2000 });
    }

    const onError = (event) => {
        // event.files == files that failed to upload
        file = undefined;
    };

    return (
        <div style={{ width: "50%", margin: "0 auto", padding: "20px", backgroundColor: "#f8f9fa" }}>
            <Toast ref={toast} />
            <FileUpload
                name="files[]"
                mode="basic"
                onSelect={onSelect}
                onError={onError}
                multiple={false}
                accept=".mp3,.wav,.mid,.midi"
                style={{
                    width: "100%",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                }}
            />
        </div>
    );
};

export default UploadButtonComponent;
