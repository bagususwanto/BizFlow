const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (
        dirFile.endsWith('.ts') &&
        !dirFile.endsWith('update_hooks.ts') &&
        !dirFile.endsWith('update_hooks.js')
      ) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walkSync(directoryPath);

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace onSuccess: (someArgs) => { toast.success(msg);
  // Match any whitespace/new lines between block start and toast.success
  // We use regex with global and multiline modifiers.

  // Replace onSuccess
  content = content.replace(
    /onSuccess:\s*\((.*?)\)\s*=>\s*\{([\s\S]*?)toast\.success\((.*?)\);/g,
    (match, args, beforeToast, toastArg) => {
      // If it already contains 'const message =', skip to avoid double processing
      if (
        beforeToast.includes('const message =') ||
        beforeToast.includes('(response as any).data?.message')
      ) {
        return match;
      }
      // Convert arguments to `(response)` if it's not already
      let newArgs = 'response';

      // Fallback message
      let fallback = toastArg;

      return `onSuccess: (${newArgs}) => {${beforeToast}const message =
        (response as any).data?.message || ${fallback};
      toast.success(message);`;
    },
  );

  // Replace onError
  content = content.replace(
    /onError:\s*\((.*?)\)\s*=>\s*\{([\s\S]*?)toast\.error\((.*?)\);[\s\S]*?\}/g,
    (match, args, beforeToast, toastArg) => {
      // Only capture simple single toast error
      return `onError: (error: Error) => {
      toast.error(error.message);
    }`;
    },
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
