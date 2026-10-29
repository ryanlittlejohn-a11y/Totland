/**
 * Native (Capacitor) print/share for printables. @capacitor/filesystem and
 * @capacitor/share are imported dynamically here, so the website's first
 * load is unaffected — this module is only ever reached from the native
 * "Make PDF" button in parent.printables.tsx.
 *
 * Flow: build the PDF with the existing (also dynamically imported) jsPDF
 * writer, write it to the app's cache directory as base64, then hand the
 * resulting file URI to the OS share sheet so a grown-up can Print / Save
 * to Files / AirDrop. Nothing is uploaded; the file stays on-device.
 */
import type { Page, PaperId } from "./printables";

/** Base64 without the data: URL prefix, for Filesystem.writeFile. */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

export type NativeShareOutcome = "shared" | "cancelled" | "error";

/** True when the error/message looks like the user dismissing the share sheet, not a real failure. */
function looksCancelled(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err ?? "").toLowerCase();
  return msg.includes("cancel") || msg.includes("abort");
}

/**
 * Render the selection to a PDF and hand it to the native share sheet.
 * Never throws — callers get a plain outcome instead (cancel is not an error).
 */
export async function makeAndSharePdf(pages: Page[], paper: PaperId, filename: string): Promise<NativeShareOutcome> {
  try {
    const [{ renderPdf }, { Filesystem, Directory }, { Share }] = await Promise.all([
      import("./printables-pdf"),
      import("@capacitor/filesystem"),
      import("@capacitor/share"),
    ]);
    const blob = await renderPdf(pages, paper);
    const base64 = await blobToBase64(blob);
    const path = `printables/${filename}`;
    const written = await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache, recursive: true });
    await Share.share({ url: written.uri });
    return "shared";
  } catch (err) {
    if (looksCancelled(err)) return "cancelled";
    console.error("[totland] native printable share failed", err);
    return "error";
  }
}
