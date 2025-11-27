import Papa from 'papaparse';

// jsDelivr CDN base URL for CSV files hosted on GitHub
// This allows us to serve large CSV files without including them in the deployment
const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/amalkantony/dashboard-data@main/public/data';

export interface CSVRecord {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  building?: string;
  [key: string]: string | undefined;
}

export interface CSVData {
  records: CSVRecord[];
  headers: string[];
}

export interface LocationFile {
  value: string;
  label: string;
  fileName: string;
}

/**
 * Get list of all available CSV files from the data directory
 */
export async function getAvailableLocations(): Promise<LocationFile[]> {
  try {
    const response = await fetch('/locations.json');
    const data = await response.json();
    return data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

/**
 * Load and parse a CSV file from jsDelivr CDN
 */
export async function loadCSVFile(fileName: string): Promise<CSVData> {
  try {
    // Fetch from jsDelivr CDN instead of local files
    const response = await fetch(`${CDN_BASE_URL}/${fileName}`);
    const text = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          const records = results.data as CSVRecord[];
          const headers = results.meta.fields || [];

          resolve({
            records: records.filter(record =>
              Object.values(record).some(value => value && value.trim() !== '')
            ),
            headers,
          });
        },
        error: (error: Error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
}

/**
 * Search records by name, phone, or email
 */
export function searchRecords(
  records: CSVRecord[],
  searchTerm: string
): CSVRecord[] {
  if (!searchTerm.trim()) return records;

  const term = searchTerm.toLowerCase();
  return records.filter((record) => {
    const name = (record.name || record.name_2 || '').toLowerCase();
    const phone = (record.phone || record.landline || record.whatsappnumber || '').toLowerCase();
    const email = (record.email || '').toLowerCase();

    return name.includes(term) || phone.includes(term) || email.includes(term);
  });
}

/**
 * Filter records by location or building
 */
export function filterRecords(
  records: CSVRecord[],
  filters: {
    location?: string;
    building?: string;
  }
): CSVRecord[] {
  let filtered = records;

  if (filters.location) {
    filtered = filtered.filter((record) => {
      const loc = (record.location || record.location_2 || '').toLowerCase();
      return loc.includes(filters.location!.toLowerCase());
    });
  }

  if (filters.building) {
    filtered = filtered.filter((record) => {
      const bldg = (
        record.building ||
        record.building_2 ||
        record.building_3 ||
        record.building_4 ||
        ''
      ).toLowerCase();
      return bldg.includes(filters.building!.toLowerCase());
    });
  }

  return filtered;
}

/**
 * Get unique values for a specific field
 */
export function getUniqueValues(
  records: CSVRecord[],
  fieldNames: string[]
): string[] {
  const values = new Set<string>();

  records.forEach((record) => {
    fieldNames.forEach((fieldName) => {
      const value = record[fieldName];
      if (value && value.trim()) {
        values.add(value.trim());
      }
    });
  });

  return Array.from(values).sort();
}

/**
 * Get aggregated statistics for visualizations
 */
export function getStatistics(records: CSVRecord[]) {
  const buildingCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};

  records.forEach((record) => {
    // Count by building
    const building =
      record.building ||
      record.building_2 ||
      record.building_3 ||
      record.building_4 ||
      'Unknown';
    buildingCounts[building] = (buildingCounts[building] || 0) + 1;

    // Count by location
    const location =
      record.location || record.location_2 || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return {
    total: records.length,
    byBuilding: Object.entries(buildingCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    byLocation: Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}
