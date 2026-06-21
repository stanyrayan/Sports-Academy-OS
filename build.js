import fs from 'fs';

try {
  if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true, force: true });
  }
  fs.cpSync('client/dist', 'public', { recursive: true });
  console.log('Successfully copied client/dist to public for Vercel deployment.');
} catch (error) {
  console.error('Error copying dist to public:', error);
  process.exit(1);
}
