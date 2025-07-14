const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/arunkum/Documents/Chumma/kiruk-in/public/images/vlogs/thumbnails';
const vlogs = [
  { id: 'tech-1' }, { id: 'tech-2' },
  { id: 'trek-1' }, { id: 'trek-2' },
  { id: 'daily-1' }, { id: 'daily-2' },
  { id: 'creative-1' },
  { id: 'travel-1' },
];

// Create directory if it doesn't exist
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
  console.log(`Created directory: ${baseDir}`);
}

// Create dummy files
vlogs.forEach(vlog => {
  const filePath = path.join(baseDir, `${vlog.id}.jpg`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, ''); // Create an empty file
    console.log(`Created: ${filePath}`);
  }
});

console.log('Vlog assets created successfully.');
