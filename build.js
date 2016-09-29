const electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: './releases/hl7-viewer-win32-x64',
  outputDirectory: './packages/',
  authors: 'Mihai Farcas',
  exe: 'hl7-viewer.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));