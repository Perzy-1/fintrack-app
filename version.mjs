import fs from 'fs';
import path from 'path';

// Path to your package.json file
const packageJsonPath = path.resolve(process.cwd(), 'package.json');

// Read the file
fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading package.json:', err);
        return;
    }

    // Parse the JSON content
    const packageJson = JSON.parse(data);

    // Get the current version
    let [major, minor, patch] = packageJson.version.split('.').map(Number);

    // Increment the patch number
    patch++;

    // Update the version in the object
    const newVersion = `${major}.${minor}.${patch}`;
    packageJson.version = newVersion;

    // Write the updated content back to the file
    fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to package.json:', err);
            return;
        }
        console.log(`Version incremented to ${newVersion}`);
    });
});
