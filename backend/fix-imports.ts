import fs from 'fs';
import path from 'path';

function fixImports(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            // Regex to find import and export statements with relative paths missing .js
            const regex = /(from\s+['"]\.[^'"]*)(?<!\.js)(['"])/g;
            if (regex.test(content)) {
                content = content.replace(regex, '$1.js$2');
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`Fixed imports in ${fullPath}`);
            }
        }
    }
}

fixImports('./src');
