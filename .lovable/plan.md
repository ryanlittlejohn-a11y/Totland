# Re-export App Clip header at 1800×1200

## Why
Apple rejected the header because it must be exactly 1800×1200 pixels, JPG or PNG, RGB. The current file (`Totland-App-Clip-Header.png`) is 3000×2000 RGB PNG — the correct artwork, wrong dimensions. Both are 3:2, so the existing art scales down cleanly with no cropping or regeneration.

## Steps
1. Downscale the existing header artwork from 3000×2000 to exactly 1800×1200 using high-quality (Lanczos) resampling, keeping RGB colors.
2. Save as a new PNG at `/mnt/documents/Totland-App-Clip-Header-1800x1200.png` (keeps the original untouched; PNG is lossless and accepted by Apple).
3. Verify: dimensions are exactly 1800×1200, color space RGB, fully opaque, no artifacts or clipped text after downscale (inspect the result).
4. Deliver the new file so it can be uploaded to App Store Connect in place of the 3000×2000 version.

## Not changing
- The artwork itself, the App Clip project files, or anything in the app — this is a media re-export only.
