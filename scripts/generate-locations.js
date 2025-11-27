const fs = require('fs');
const path = require('path');

// Generate locations.json from CSV files in public/data
function generateLocations() {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const outputPath = path.join(__dirname, '..', 'public', 'locations.json');

  try {
    const files = fs.readdirSync(dataDir);

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

    const output = { locations: csvFiles };

    // Write to public directory
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`✅ Generated locations.json with ${csvFiles.length} locations`);
  } catch (error) {
    console.error('❌ Error generating locations:', error);
    process.exit(1);
  }
}

generateLocations();
