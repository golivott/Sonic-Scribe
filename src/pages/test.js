import * as React from "react";
import StaffVisualizer from "../StaffVisualizer";
import PianoRollVisualizer from "../PianoRollVisualizer";

const TestPage = () => {
    return (
        <>
            <PianoRollVisualizer></PianoRollVisualizer>
            <StaffVisualizer></StaffVisualizer>
        </>
    );
};

export default TestPage;

export const Head = () => <title>Test Page</title>;
