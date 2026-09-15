import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Prevent directory traversal attacks
  const safeFilename = path.basename(filename);
  const filePath = path.resolve(process.cwd(), 'public/media', safeFilename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File Not Found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(safeFilename).toLowerCase().replace('.', '');
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
