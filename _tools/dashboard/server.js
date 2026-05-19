var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;

// ── Config ──────────────────────────────────────────────────────────────────
var MEM = process.env.MEM_PATH || path.join(__dirname, '../../.claude/memory/');
var REPO = process.env.REPO_PATH || path.join(__dirname, '../..');
var HEALTH_URL = process.env.HEALTH_URL || '';   // optional: URL to ping for server status
var PORT = 3030;
var PUBLIC = path.join(__dirname, 'public');
var PROMPTS_FILE = path.join(__dirname, 'prompts.json');

function readSafe(file) {
    try { return fs.readFileSync(file, 'utf8'); } catch(e) { return ''; }
}

function parseStatus() {
    var content = readSafe(path.join(MEM, 'STATUS.md'));
    var sessionMatch = content.match(/Session (\d+) complete/);
    var session = sessionMatch ? sessionMatch[1] : '?';
    var changeMatch = content.match(/Session \d+ complete\.\*\* (.+)/);
    var lastChange = 'No recent data';
    if (changeMatch) {
        lastChange = changeMatch[1]
            .replace(/\*\*/g, '')
            .replace(/`/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '');
        if (lastChange.length > 130) { lastChange = lastChange.substring(0, 130) + '...'; }
    }
    return { session: session, lastChange: lastChange };
}

function getGit() {
    try {
        var branch = exec('git -C "' + REPO + '" branch --show-current', { encoding: 'utf8' }).trim();
        var dirty = exec('git -C "' + REPO + '" status --short', { encoding: 'utf8' }).trim();
        var commit = exec('git -C "' + REPO + '" log -1 --pretty=%s', { encoding: 'utf8' }).trim();
        if (commit.length > 65) { commit = commit.substring(0, 65) + '...'; }
        return { branch: branch || 'main', clean: dirty === '', lastCommit: commit };
    } catch(e) {
        return { branch: 'unknown', clean: true, lastCommit: '' };
    }
}

function checkHealth(cb) {
    if (!HEALTH_URL) { cb(null); return; }
    var done = false;
    var mod = HEALTH_URL.startsWith('https') ? https : http;
    var req = mod.get(HEALTH_URL, function(res) {
        if (!done) { done = true; cb(res.statusCode < 400); }
        res.resume();
    });
    req.on('error', function() { if (!done) { done = true; cb(false); } });
    req.setTimeout(1800, function() { req.destroy(); if (!done) { done = true; cb(false); } });
}

function readBody(req, cb) {
    var body = '';
    req.on('data', function(d) { body += d; });
    req.on('end', function() { try { cb(JSON.parse(body)); } catch(e) { cb({}); } });
}

var MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };

var server = http.createServer(function(req, res) {

    if (req.url === '/api/push' && req.method === 'POST') {
        try {
            var out = exec('git -C "' + REPO + '" push 2>&1', { encoding: 'utf8' }).trim();
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ ok: true, msg: out || 'Pushed.' }));
        } catch(e) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ ok: false, msg: e.message || 'Push failed.' }));
        }
        return;
    }

    if (req.url === '/api/prompts' && req.method === 'GET') {
        try {
            var pdata = fs.readFileSync(PROMPTS_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(pdata);
        } catch(e) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end('[]');
        }
        return;
    }

    if (req.url === '/api/prompts' && req.method === 'POST') {
        readBody(req, function(body) {
            var prompts = Array.isArray(body) ? body : [];
            fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ ok: true }));
        });
        return;
    }

    if (req.url === '/api/status') {
        var status = parseStatus();
        var git = getGit();
        checkHealth(function(healthy) {
            var data = {
                session: status.session,
                lastChange: status.lastChange,
                git: git,
                healthy: healthy,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(data));
        });
        return;
    }

    var urlPath = req.url === '/' ? '/index.html' : req.url;
    var filePath = path.join(PUBLIC, urlPath);
    var ext = path.extname(filePath);

    fs.readFile(filePath, function(err, data) {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data);
    });
});

server.listen(PORT, function() {
    console.log('');
    console.log('  Dashboard  ->  http://localhost:' + PORT);
    console.log('  Set MEM_PATH env var to point to your memory folder');
    console.log('  Set HEALTH_URL env var to ping your server (optional)');
    console.log('');
});
