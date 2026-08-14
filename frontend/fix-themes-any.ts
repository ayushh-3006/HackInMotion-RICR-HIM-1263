import fs from 'fs';
import path from 'path';

function fixThemes(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.tsx')) {
            const fullPath = path.join(dir, file);
            let content = fs.readFileSync(fullPath, 'utf-8');
            
            // Replace `data: Resume` with `data: any` in props
            content = content.replace(/\{ data \}: \{ data: Resume \}/g, '{ data }: { data: any }');
            content = content.replace(/interface [a-zA-Z]+Props \{\s*data: Resume;\s*\}/g, (match) => {
                return match.replace('data: Resume;', 'data: any;');
            });
            content = content.replace(/data: Resume/g, 'data: any'); // Fallback

            fs.writeFileSync(fullPath, content, 'utf-8');
            console.log(`Set data to any in ${fullPath}`);
        }
    }
}

fixThemes('./components/ResumeThemes');
