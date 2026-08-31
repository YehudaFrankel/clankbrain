const JSZip = require('jszip');
const https = require('https');

var GITHUB_FILES = [
  { path: 'tools/memory.py', zipPath: 'tools/memory.py' },
  { path: 'tools/team_sync.py', zipPath: 'tools/team_sync.py' },
  { path: 'tools/telemetry.py', zipPath: 'tools/telemetry.py' }
];

var GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/YehudaFrankel/clankbrain/main/';

function fetchFile(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }
      var data = [];
      res.on('data', function(chunk) { data.push(chunk); });
      res.on('end', function() { resolve(Buffer.concat(data).toString('utf8')); });
      res.on('error', function() { resolve(null); });
    }).on('error', function() { resolve(null); });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    var filesJson = req.body.files;
    if (typeof filesJson === 'string') {
      filesJson = JSON.parse(filesJson);
    }

    if (!filesJson || typeof filesJson !== 'object') {
      return res.status(400).json({ error: 'No files provided' });
    }

    var zip = new JSZip();
    var claudeFolder = zip.folder('.claude');

    // Add generated template files
    var fileNames = Object.keys(filesJson);
    for (var i = 0; i < fileNames.length; i++) {
      var fileName = fileNames[i];
      var content = filesJson[fileName];
      claudeFolder.file(fileName, content);
    }

    // Fetch and add Python tools from GitHub
    for (var j = 0; j < GITHUB_FILES.length; j++) {
      var gf = GITHUB_FILES[j];
      var fileContent = await fetchFile(GITHUB_RAW_BASE + gf.path);
      if (fileContent) {
        claudeFolder.file(gf.zipPath, fileContent);
      }
    }

    var zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="claude-setup.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Zip error:', err.message);
    return res.status(500).json({ error: 'Failed to create zip' });
  }
};
