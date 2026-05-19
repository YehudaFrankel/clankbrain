var firstLoad = true;
var lastSession = 0;

function refresh() {
    fetch('/api/status')
        .then(function(r) { return r.json(); })
        .then(render)
        .catch(function() {});
}

function render(d) {
    var sessionNum = parseInt(d.session, 10) || 0;

    if (firstLoad) {
        countUp(sessionNum);
        firstLoad = false;
    } else {
        document.getElementById('sessionBadge').textContent = 'S' + d.session;
        if (sessionNum !== lastSession) { flash('sessionBadge'); }
    }
    lastSession = sessionNum;

    document.getElementById('lastUpdated').textContent = d.time;

    // Health pill
    var healthPill = document.getElementById('healthPill');
    var healthLabel = document.getElementById('healthLabel');
    if (d.healthy === null) {
        healthPill.className = 'pill none';
        healthLabel.textContent = 'SERVER  N/A';
    } else {
        healthPill.className = 'pill ' + (d.healthy ? 'online' : 'offline');
        healthLabel.textContent = d.healthy ? 'SERVER  UP' : 'SERVER  DOWN';
    }

    // Git pill
    var gitPill = document.getElementById('gitPill');
    var gitLabel = document.getElementById('gitLabel');
    gitPill.className = 'pill ' + (d.git.clean ? 'clean' : 'dirty');
    gitLabel.textContent = d.git.branch + (d.git.clean ? '  CLEAN' : '  DIRTY');

    setText('lastChange', d.lastChange);
    setText('lastCommit', d.git.lastCommit);
}

function setText(id, value) {
    var el = document.getElementById(id);
    if (el.textContent !== value) { el.textContent = value; flash(id); }
}

function flash(id) {
    var el = document.getElementById(id);
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
}

function countUp(target) {
    var badge = document.getElementById('sessionBadge');
    var n = Math.max(0, target - 30);
    var interval = setInterval(function() {
        n = Math.min(n + 1, target);
        badge.textContent = 'S' + n;
        if (n >= target) { clearInterval(interval); }
    }, 28);
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function copy(btn, text) {
    btn.classList.add('ripple');
    setTimeout(function() { btn.classList.remove('ripple'); }, 350);
    navigator.clipboard.writeText(text).then(function() {
        var msg = document.getElementById('copyMsg');
        msg.textContent = 'Copied  ' + text.split('\n')[0];
        setTimeout(function() { msg.textContent = ''; }, 2000);
    }).catch(function() {
        var msg = document.getElementById('copyMsg');
        msg.textContent = 'Copy not supported here';
        setTimeout(function() { msg.textContent = ''; }, 2000);
    });
}

function pushToGit(btn) {
    var msg = document.getElementById('copyMsg');
    btn.disabled = true;
    msg.textContent = 'Pushing...';
    fetch('/api/push', { method: 'POST' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            msg.textContent = d.ok ? '✓ ' + d.msg : '✗ ' + d.msg;
            setTimeout(function() { msg.textContent = ''; }, 4000);
        })
        .catch(function(e) { msg.textContent = '✗ ' + e.message; })
        .finally(function() { btn.disabled = false; refresh(); });
}

// ── Saved Prompts ────────────────────────────────────────────────────────────

var DEFAULT_PROMPTS = [
    { name: 'Start',    text: 'Start Session' },
    { name: 'End',      text: 'End Session' },
    { name: 'Smoke',    text: '/smoke-test' },
    { name: 'Guard',    text: '/guard' },
    { name: 'Learn',    text: '/learn' },
    { name: 'Mem Push', text: 'Push Memory' },
    { name: 'Git Push', text: 'git push' }
];

function persistPrompts(prompts, cb) {
    fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompts)
    }).then(function() { if (cb) { cb(); } }).catch(function() { if (cb) { cb(); } });
}

function loadAndRenderPrompts() {
    fetch('/api/prompts')
        .then(function(r) { return r.json(); })
        .then(function(prompts) {
            if (!Array.isArray(prompts) || prompts.length === 0) {
                prompts = DEFAULT_PROMPTS.slice();
                persistPrompts(prompts);
            }
            renderSavedPrompts(prompts);
        })
        .catch(function() { renderSavedPrompts(DEFAULT_PROMPTS.slice()); });
}

function renderSavedPrompts(prompts) {
    var area = document.getElementById('savedPromptsArea');
    var html = '';
    for (var i = 0; i < prompts.length; i++) {
        html += '<div class="prompt-wrap">';
        html += '<button type="button" class="btn" data-text="' + escAttr(prompts[i].text) + '" onclick="copyPrompt(this)">' + escHtml(prompts[i].name) + '</button>';
        html += '<button type="button" class="btn-del" onclick="deletePrompt(' + i + ')" title="Delete">&#215;</button>';
        html += '</div>';
    }
    html += '<button type="button" class="btn btn-gitpush" onclick="pushToGit(this)">Git Push</button>';
    area.innerHTML = html;
}

function copyPrompt(btn) {
    copy(btn, btn.getAttribute('data-text'));
}

function deletePrompt(index) {
    fetch('/api/prompts')
        .then(function(r) { return r.json(); })
        .then(function(prompts) {
            prompts.splice(index, 1);
            persistPrompts(prompts, loadAndRenderPrompts);
        }).catch(function() {});
}

function sendQuickPrompt() {
    var target = document.getElementById('qpTarget').value.trim();
    var action = document.getElementById('qpAction').value.trim();
    var saveName = document.getElementById('qpSaveName').value.trim();
    var btn = document.querySelector('.btn-send');
    if (!target && !action) { return; }
    var text;
    if (target && action) {
        text = 'Working on: ' + target + '\nTask: ' + action + '\n\nContext: Check existing patterns before proposing. Full plan required before any edit.';
    } else {
        text = target ? target : action;
    }
    copy(btn, text);
    if (saveName) {
        fetch('/api/prompts')
            .then(function(r) { return r.json(); })
            .then(function(prompts) {
                if (!Array.isArray(prompts)) { prompts = []; }
                prompts.push({ name: saveName, text: text });
                persistPrompts(prompts, loadAndRenderPrompts);
            }).catch(function() {});
        document.getElementById('qpSaveName').value = '';
    }
    document.getElementById('qpTarget').value = '';
    document.getElementById('qpAction').value = '';
}

loadAndRenderPrompts();
setInterval(refresh, 10000);
refresh();
