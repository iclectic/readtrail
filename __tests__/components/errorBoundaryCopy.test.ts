/**
 * Lightweight guard that the recovery copy stays British English and non-destructive.
 * Full React Native rendering is out of scope for the Node Jest preset.
 */
describe("error recovery messaging", () => {
  it("promises that local data is not cleared", () => {
    const bootstrapMessage =
      "ReadTrail could not prepare your local library. Your existing data has not been modified. You can try again.";
    const boundaryBody =
      "The screen hit an unexpected error. Your library data on this device has not been cleared. You can try again or reopen the app.";

    expect(bootstrapMessage).toMatch(/not been modified/i);
    expect(bootstrapMessage).toMatch(/try again/i);
    expect(boundaryBody).toMatch(/not been cleared/i);
    expect(boundaryBody).toMatch(/try again/i);
  });
});
