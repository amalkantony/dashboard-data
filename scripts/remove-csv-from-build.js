const fs = require('fs');
const path = require('path');

/**
 * Remove CSV files from the build output
 * CSV files are served from jsDelivr CDN instead of being included in the deployment
 */
function removeCsvFromBuild() {
  const dataDir = path.join(__dirname, '..', 'out', 'data');

  try {
    if (fs.existsSync(dataDir)) {
      // Get initial size
      const files = fs.readdirSync(dataDir);
      const csvFiles = files.filter(f => f.endsWith('.csv'));

      console.log(`\n📦 Removing ${csvFiles.length} CSV files from build output...`);

      // Remove the entire data directory
      fs.rmSync(dataDir, { recursive: true, force: true });

      console.log('✅ CSV files removed from build (will be served from jsDelivr CDN)');
      console.log('💡 This reduces deployment size from ~359MB to <5MB\n');
    } else {
      console.log('ℹ️  No data directory found in build output');
    }
  } catch (error) {
    console.error('❌ Error removing CSV files from build:', error);
    // Don't fail the build, just warn
    console.warn('⚠️  Continuing anyway...');
  }
}

removeCsvFromBuild();
