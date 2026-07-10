const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./frontend/src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const regex = /from\s+['"](\.\/|\.\.\/)([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const importPath = match[2];
        const dir = path.dirname(file);
        const targetPath = path.resolve(dir, match[1] + importPath);
        
        const targetDir = path.dirname(targetPath);
        const targetBase = path.basename(targetPath);
        
        if (fs.existsSync(targetDir)) {
            const filesInDir = fs.readdirSync(targetDir);
            let found = false;
            for (const f of filesInDir) {
                if (f === targetBase || f === targetBase + '.ts' || f === targetBase + '.tsx' || f === targetBase + '.css' || f === targetBase + '/index.ts' || f === targetBase + '/index.tsx') {
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log('Case mismatch in ' + file + ': imported ' + importPath);
            }
        }
    }
})
console.log('Done checking case mismatches');
