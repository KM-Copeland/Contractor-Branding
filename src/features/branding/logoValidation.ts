export type LogoValidationStatus = 'success' | 'warning' | 'error';
export interface LogoValidationResult {
  status: LogoValidationStatus;
  format: string;
  dimensions: { width: number; height: number } | null;
  dpi: { x: number; y: number } | null;
  effectiveDpi: { x: number; y: number } | null;
  failures: string[];
  warnings: string[];
  unverified: string[];
  summary: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const supportedExtensions = new Set(['jpg', 'jpeg', 'png', 'svg']);
const decoder = new TextDecoder();

function errorResult(format: string, failure: string): LogoValidationResult {
  return { status: 'error', format, dimensions: null, dpi: null, effectiveDpi: null, failures: [failure], warnings: [], unverified: [], summary: 'Logo does not meet upload requirements' };
}

function jpegMetadata(bytes: Uint8Array) {
  let dpi: { x: number; y: number } | null = null;
  let dimensions: { width: number; height: number } | null = null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 4 < bytes.length && bytes[offset] === 0xff) {
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const segmentLength = view.getUint16(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;
    const data = offset + 2;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && segmentLength >= 7) {
      dimensions = { height: view.getUint16(data + 1), width: view.getUint16(data + 3) };
    }
    if (marker === 0xe0 && segmentLength >= 16 && decoder.decode(bytes.subarray(data, data + 5)) === 'JFIF\0') {
      const unit = bytes[data + 7];
      if (unit) {
        const factor = unit === 2 ? 2.54 : 1;
        dpi = { x: view.getUint16(data + 8) * factor, y: view.getUint16(data + 10) * factor };
      }
    }
    if (marker === 0xe1 && segmentLength >= 14 && decoder.decode(bytes.subarray(data, data + 6)) === 'Exif\0\0') {
      const tiff = data + 6;
      const little = decoder.decode(bytes.subarray(tiff, tiff + 2)) === 'II';
      const get16 = (position: number) => view.getUint16(position, little);
      const get32 = (position: number) => view.getUint32(position, little);
      try {
        const ifd = tiff + get32(tiff + 4);
        const count = get16(ifd);
        let x: number | null = null; let y: number | null = null; let unit = 2;
        for (let i = 0; i < count; i++) {
          const entry = ifd + 2 + i * 12;
          const tag = get16(entry); const type = get16(entry + 2); const n = get32(entry + 4);
          if (tag === 0x011a || tag === 0x011b) {
            const valueAt = tiff + get32(entry + 8);
            const numerator = get32(valueAt); const denominator = get32(valueAt + 4);
            if (denominator) { if (tag === 0x011a) x = numerator / denominator; else y = numerator / denominator; }
          } else if (tag === 0x0128) { const valueAt = n === 1 ? entry + 8 : tiff + get32(entry + 8); unit = type === 3 ? get16(valueAt) : get32(valueAt); }
        }
        if (x && y) { const factor = unit === 3 ? 2.54 : 1; dpi = { x: x * factor, y: y * factor }; }
      } catch { /* malformed EXIF density is treated as unavailable */ }
    }
    offset += segmentLength;
  }
  return { dpi, dimensions };
}

function pngMetadata(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let dpi: { x: number; y: number } | null = null;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = decoder.decode(bytes.subarray(offset + 4, offset + 8));
    if (length > bytes.length - offset - 12) break;
    if (type === 'pHYs' && length === 9 && bytes[offset + 16] === 1) {
      dpi = { x: view.getUint32(offset + 8) / 39.37007874, y: view.getUint32(offset + 12) / 39.37007874 };
    }
    offset += length + 12;
    if (type === 'IEND') break;
  }
  return dpi;
}

function bmpMetadata(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 30) return null;
  const dibSize = view.getUint32(14, true);
  if (dibSize < 40 || bytes.length < 54) return null;
  const width = view.getInt32(18, true);
  const height = Math.abs(view.getInt32(22, true));
  const xppm = view.getInt32(38, true); const yppm = view.getInt32(42, true);
  return { width, height, dpi: xppm > 0 && yppm > 0 ? { x: xppm / 39.37007874, y: yppm / 39.37007874 } : null };
}

function sanitizeSvg(bytes: Uint8Array): string | null {
  const source = decoder.decode(bytes);
  const document = new DOMParser().parseFromString(source, 'image/svg+xml');
  const root = document.documentElement;
  if (root.localName !== 'svg' || document.querySelector('parsererror')) return null;
  if (document.querySelector('script, foreignObject, iframe, object, embed, audio, video')) return null;
  for (const element of Array.from(document.querySelectorAll('*'))) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase(); const value = attribute.value.trim();
      if (name.startsWith('on') || ((name === 'href' || name.endsWith(':href')) && value && !value.startsWith('#') && !/^data:image\/(png|jpeg|gif|webp);base64,/i.test(value))) return null;
      if ((name === 'style' || name === 'fill' || name === 'filter') && /url\s*\(\s*['"]?(?!#)/i.test(value)) return null;
    }
  }
  if (/<!DOCTYPE|xml-stylesheet|@import|url\s*\(\s*['"]?(?!#)/i.test(source)) return null;
  return source;
}

export async function validateLogoFile(file: File): Promise<LogoValidationResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!file.size) return errorResult(extension, 'The selected file is empty. Choose a valid logo file.');
  if (file.size > MAX_FILE_BYTES) return errorResult(extension, 'This file is larger than 10 MB. Choose a smaller file.');
  if (!supportedExtensions.has(extension)) return errorResult(extension, 'Unsupported file type. Choose JPG, PNG, or SVG.');

  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer());
  let format = '';
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte)) format = 'png';
  else if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) format = 'jpeg';
  else if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) format = 'bmp';
  else if (decoder.decode(bytes.subarray(0, Math.min(bytes.length, 1024))).includes('%PDF-')) format = 'pdf';
  else if (decoder.decode(bytes.subarray(0, Math.min(bytes.length, 1024))).startsWith('%!PS-Adobe')) format = 'eps';
  else if (extension === 'svg' && sanitizeSvg(new Uint8Array(await file.arrayBuffer()))) format = 'svg';

  if (!format) return errorResult(extension, 'The file is unreadable or its contents do not match a supported logo format.');
  if ((extension === 'jpg' || extension === 'jpeg') ? format !== 'jpeg' : extension !== format) {
    return errorResult(format, `The .${extension} extension does not match the actual ${format.toUpperCase()} file contents. Rename or re-export the file with the correct format.`);
  }

  const failures: string[] = []; const warnings: string[] = []; const unverified: string[] = [];
  let dimensions: { width: number; height: number } | null = null;
  let dpi: { x: number; y: number } | null = null;
  if (format === 'png') {
    const full = new Uint8Array(await file.arrayBuffer()); const view = new DataView(full.buffer);
    if (full.length < 33) return errorResult(format, 'The PNG image data is incomplete or corrupted. Re-export the logo and try again.');
    dimensions = { width: view.getUint32(16), height: view.getUint32(20) }; dpi = pngMetadata(full);
  } else if (format === 'jpeg') {
    const metadata = jpegMetadata(bytes); dimensions = metadata.dimensions; dpi = metadata.dpi;
  } else if (format === 'bmp') {
    const metadata = bmpMetadata(bytes);
    if (!metadata) return errorResult(format, 'The BMP header is invalid or incomplete. Re-export the logo and try again.');
    dimensions = { width: metadata.width, height: metadata.height }; dpi = metadata.dpi;
  }

  if (format === 'png' || format === 'jpeg' || format === 'bmp') {
    try {
      const bitmap = await createImageBitmap(file);
      dimensions = { width: dimensions?.width || bitmap.width, height: dimensions?.height || bitmap.height };
      bitmap.close();
    } catch { return errorResult(format, 'The image cannot be decoded. Re-export it as a valid image and try again.'); }
    if (!dimensions || dimensions.width < 1 || dimensions.height < 1) return errorResult(format, 'The image dimensions are invalid. Re-export it and try again.');
    if (dimensions.width < 600) failures.push(`Image is ${dimensions.width}px wide; the minimum is 600px. Upload a larger source image.`);
    if (!dpi || dpi.x <= 0 || dpi.y <= 0) warnings.push('DPI metadata was not found. Source pixel dimensions are available, but print resolution cannot be confirmed.');
    else if (Math.round(dpi.x) < 300 || Math.round(dpi.y) < 300) warnings.push(`DPI metadata is ${Math.round(dpi.x)} × ${Math.round(dpi.y)}; 300 DPI is recommended for printing.`);
    unverified.push('Effective DPI depends on the final printed size, which is not specified for these products.');
  } else if (format === 'pdf') {
    const tail = decoder.decode(new Uint8Array(await file.slice(Math.max(0, file.size - 2048)).arrayBuffer()));
    if (!tail.includes('%%EOF')) return errorResult(format, 'The PDF is missing its end marker or is incomplete. Re-export the document and try again.');
    warnings.push('PDF structure looks plausible, but vector content, embedded-image resolution, and colors need print review.');
    unverified.push('PDF artwork type and embedded image resolution were not inspected.');
  } else if (format === 'eps') {
    const source = decoder.decode(bytes);
    const tail = decoder.decode(new Uint8Array(await file.slice(Math.max(0, file.size - 2048)).arrayBuffer()));
    if (!tail.includes('%%EOF')) return errorResult(format, 'The EPS file is missing its end marker or is incomplete. Re-export the artwork and try again.');
    if (!source.includes('%%BoundingBox:') && !source.includes('%%HiResBoundingBox:')) warnings.push('EPS header is recognized, but its print bounds could not be confirmed.');
    warnings.push('Vector content, embedded-image resolution, and colors need print review.');
    unverified.push('EPS artwork was not interpreted or rendered in the browser.');
  } else if (format === 'svg') {
    warnings.push('SVG structure is valid, but print dimensions and color specifications need print review.');
    unverified.push('Effective DPI and Pantone/PMS color matching cannot be confirmed automatically.');
  }

  if (failures.length) return { status: 'error', format, dimensions, dpi, effectiveDpi: null, failures, warnings, unverified, summary: 'Logo does not meet upload requirements' };
  const status = warnings.length ? 'warning' : 'success';
  return { status, format, dimensions, dpi, effectiveDpi: null, failures, warnings, unverified, summary: status === 'success' ? 'Logo meets preliminary print requirements' : 'Logo may require print review' };
}
