import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.join(__dirname, 'ui/src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

// Regular expression to match import/require statements
const IMPORT_REGEX = /(?:import|export)(?:\s+[^'"\n]+\s+from\s+)?['"](\..*?)['"]/g;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Process each import/export statement
  const newContent = content.replace(IMPORT_REGEX, (match, importPath) => {
    // Skip if it's not a relative import or already has an extension
    if (!importPath.startsWith('.') || /\.[a-zA-Z0-9]+$/.test(importPath)) {
      return match;
    }

    // Check if the file exists with different extensions
    const dir = path.dirname(filePath);
    const basePath = path.join(dir, importPath);
    
    for (const ext of EXTENSIONS) {
      if (fs.existsSync(`${basePath}${ext}`)) {
        const newImportPath = `${importPath}${ext}`;
        modified = true;
        return match.replace(importPath, newImportPath);
      }
      
      // Check for index files
      if (fs.existsSync(path.join(basePath, `index${ext}`))) {
        const newImportPath = `${importPath}/index${ext}`;
        modified = true;
        return match.replace(importPath, newImportPath);
      }
    }
    
    return match;
  });

  // Write the file back if it was modified
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        processDirectory(fullPath);
      }
    } else if (EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      processFile(fullPath);
    }
  });
}

console.log('Starting to update imports...');
processDirectory(SOURCE_DIR);
console.log('Import update complete!');
