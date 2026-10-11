var zlib = require('zlib');

// Minimal ZIP writer using Node's built-in zlib, so the package needs no dependencies.
var CRC_TABLE = (function () {
  var table = [];
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function dosTime(date) {
  return ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF;
}

function dosDate(date) {
  return (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF;
}

// entries: [{ name: 'dir/file.txt', data: 'text or Buffer' }]
function buildZip(entries) {
  var now = new Date();
  var time = dosTime(now);
  var date = dosDate(now);
  var localParts = [];
  var centralParts = [];
  var offset = 0;

  for (var i = 0; i < entries.length; i++) {
    var name = Buffer.from(entries[i].name, 'utf8');
    var raw = Buffer.isBuffer(entries[i].data) ? entries[i].data : Buffer.from(String(entries[i].data), 'utf8');
    var packed = zlib.deflateRawSync(raw, { level: 9 });
    var crc = crc32(raw);

    var local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, packed);

    var central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + packed.length;
  }

  var centralBuf = Buffer.concat(centralParts);
  var end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat(localParts.concat([centralBuf, end]));
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

    // Files that belong at the project root, not inside .claude/
    var rootFiles = { 'memory.ps1': true, 'setup.ps1': true };

    var entries = [];
    var fileNames = Object.keys(filesJson);
    for (var i = 0; i < fileNames.length; i++) {
      var fileName = fileNames[i];
      var zipName = rootFiles[fileName] ? fileName : '.claude/' + fileName;
      entries.push({ name: zipName, data: filesJson[fileName] });
    }

    var zipBuffer = buildZip(entries);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="claude-setup.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Zip error:', err.message);
    return res.status(500).json({ error: 'Failed to create zip' });
  }
};

module.exports.buildZip = buildZip;
