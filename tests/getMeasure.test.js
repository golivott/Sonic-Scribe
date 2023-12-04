import { getMeasure, getStaffInfo } from "../src/midiToMusicXML/musicxml_convert";
import { ANNA_MAGDALENA_BACH, DOUBLE_SCALE, DOUBLE_SCALE_TIME_SIG_CHANGE } from "../src/SampleNoteSequences";
import { DEFAULT_TIME_SIGNATURE } from "../src/midiToMusicXML/staff_info";

test("Testing 4/4 at measure 1", () => {
    expect(getMeasure(0, [DEFAULT_TIME_SIGNATURE])).toBe(1);
});

test("Testing 4/4 at measure 2", () => {
    expect(getMeasure(1024, [DEFAULT_TIME_SIGNATURE])).toBe(2);
});

test("Testing 3/4 at measure 1", () => {
    expect(getMeasure(0, getStaffInfo(ANNA_MAGDALENA_BACH).timeSignatures)).toBe(1);
});

test("Testing 3/4 at measure 2", () => {
    expect(getMeasure(768, getStaffInfo(ANNA_MAGDALENA_BACH).timeSignatures)).toBe(2);
});

test("Testing 2/4 at measure 1", () => {
    expect(getMeasure(0, getStaffInfo(DOUBLE_SCALE).timeSignatures)).toBe(1);
});

test("Testing 2/4 at measure 2", () => {
    expect(getMeasure(512, getStaffInfo(DOUBLE_SCALE).timeSignatures)).toBe(2);
});

test("Testing 2/4 at measure 3", () => {
    expect(getMeasure(1024, getStaffInfo(DOUBLE_SCALE).timeSignatures)).toBe(3);
});

test("Testing 2/4 to 4/4 time sig change at measure 1", () => {
    expect(getMeasure(0, getStaffInfo(DOUBLE_SCALE_TIME_SIG_CHANGE).timeSignatures)).toBe(1);
});

test("Testing 2/4 to 4/4 time sig change at measure 4", () => {
    expect(getMeasure(2048, getStaffInfo(DOUBLE_SCALE_TIME_SIG_CHANGE).timeSignatures)).toBe(4);
});
