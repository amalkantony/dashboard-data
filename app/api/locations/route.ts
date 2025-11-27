import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'public', 'data');
    const files = await readdir(dataDir);

    const csvFiles = files
      .filter((file) => file.endsWith('_data.csv'))
      .map((file) => {
        // Convert filename to readable label
        // e.g., "dubai_hills_2025_data.csv" -> "Dubai Hills 2025"
        const label = file
          .replace('_data.csv', '')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          value: file.replace('_data.csv', ''),
          label,
          fileName: file,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json({ locations: csvFiles });
  } catch (error) {
    console.error('Error reading data directory:', error);
    return NextResponse.json(
      { error: 'Failed to load locations' },
      { status: 500 }
    );
  }
}
