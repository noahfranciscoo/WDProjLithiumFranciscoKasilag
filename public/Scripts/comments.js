let notificationCallback = null;

const emojiList = [
    "😀","😃","😄","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😋","😛","😜","🤪","😎",
    "🥳","😏","😒","😞","😔","😟","😕","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯",
    "😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦",
    "😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿",
    "🤡","💩","👻","💀","☠️","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾","👋","🤚","🖐",
    "✋","🖖","👌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","👍","👎","✊","👊","🤛","🤜","👏",
    "🙌","👐","🤲","🤝","🙏","💪","🧠","👀","👁️","💋","👄","🦷","👅","❤","🧡","💛","💚","💙","💜","🤎",
    "🖤","🤍","💔","❣","💕","💞","💓","💗","💖","💘","💝","🔥","✨","🌟","⭐","🎵","🎶","❗","❓","💤"
];

function togglePasswordVisibility() {
    const passInput = document.getElementById('userPassword');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.src = 'assets/open.png';
    } else {
        passInput.type = 'password';
        eyeIcon.src = 'assets/closed.png';
    }
}

function showTerminalNotification(message, type, callback = null) {
    const modal = document.getElementById('terminalModal');
    const msgBox = document.getElementById('modalMessage');
    const titleBox = document.getElementById('modalTitle');
    const inputField = document.getElementById('modalInput');
    const actionBtn = document.getElementById('modalActionBtn');
    const emojiBtn = document.getElementById('emojiToggleModal');

    modal.style.display = 'flex';
    msgBox.innerText = message;
    notificationCallback = callback;

    modal.classList.remove('modal-error', 'modal-success', 'modal-prompt');
    inputField.style.display = 'none';
    inputField.value = '';
    if(emojiBtn) emojiBtn.style.display = 'none';

    if (type === 'error') {
        modal.classList.add('modal-error');
        titleBox.innerText = ">> SYSTEM ERROR";
        actionBtn.innerText = "ACKNOWLEDGE";
    } else if (type === 'success') {
        modal.classList.add('modal-success');
        titleBox.innerText = ">> SUCCESS";
        actionBtn.innerText = "PROCEED";
    } else if (type === 'prompt') {
        modal.classList.add('modal-prompt');
        titleBox.innerText = ">> AUTHENTICATION REQUIRED";
        inputField.style.display = 'block';
        inputField.focus();
        actionBtn.innerText = "SUBMIT";
        
        if (message === "ENTER NEW CONTENT:") {
             if(emojiBtn) emojiBtn.style.display = 'block';
        }
    }
}

function handleModalAction() {
    const modal = document.getElementById('terminalModal');
    const inputVal = document.getElementById('modalInput').value;

    if (notificationCallback) {
        notificationCallback(inputVal);
    } else {
        modal.style.display = 'none';
    }
}

function toggleEmojiPicker(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (grid.style.display === 'grid') {
        grid.style.display = 'none';
    } else {
        if (grid.innerHTML === '') {
            emojiList.forEach(emoji => {
                const span = document.createElement('span');
                span.className = 'emoji-item';
                span.innerText = emoji;
                span.onclick = () => insertEmoji(emoji, gridId);
                grid.appendChild(span);
            });
        }
        grid.style.display = 'grid';
    }
}

function insertEmoji(emoji, gridId) {
    let targetInput;
    if (gridId === 'creatorEmojiGrid') {
        targetInput = document.getElementById('commentTextArea');
    } else if (gridId === 'modalEmojiGrid') {
        targetInput = document.getElementById('modalInput');
    }

    if (targetInput) {
        const start = targetInput.selectionStart;
        const end = targetInput.selectionEnd;
        const text = targetInput.value;
        targetInput.value = text.substring(0, start) + emoji + text.substring(end);
        targetInput.selectionStart = targetInput.selectionEnd = start + emoji.length;
        targetInput.focus();
    }
    document.getElementById(gridId).style.display = 'none';
}

function saveComment(event) {
    event.preventDefault();
    const identifier = document.getElementById('userIdentifier').value;
    const password = document.getElementById('userPassword').value;
    const tag = document.getElementById('commentTag').value;
    const commentBody = document.getElementById('commentTextArea').value;

    if (!identifier || !password || !commentBody) {
        showTerminalNotification("DATA PACKET INCOMPLETE. ALL FIELDS REQUIRED.", "error");
        return;
    }

    const existingComments = JSON.parse(localStorage.getItem('twr_comments')) || [];
    const userMatch = existingComments.find(c => c.user === identifier);
    if (userMatch && userMatch.pass !== password) {
        showTerminalNotification("IDENTITY CONFLICT: INCORRECT PASSWORD FOR THIS USER ID.", "error");
        return;
    }

    const newComment = {
        id: Date.now(),
        user: identifier,
        pass: password,
        tag: tag,
        text: commentBody
    };

    existingComments.push(newComment);
    localStorage.setItem('twr_comments', JSON.stringify(existingComments));
    
    showTerminalNotification("COMMENT UPLOADED SUCCESSFULLY.", "success", () => {
        window.location.href = 'commentboard_page.html';
    });
}

function performDeletion(id) {
    const existingComments = JSON.parse(localStorage.getItem('twr_comments')) || [];
    const updatedComments = existingComments.filter(c => c.id !== id);
    localStorage.setItem('twr_comments', JSON.stringify(updatedComments));
    
    document.getElementById('terminalModal').style.display = 'none';
    setTimeout(() => location.reload(), 100);
}

function deleteComment(commentId) {
    showTerminalNotification("ENTER PASSWORD TO DELETE:", "prompt", (inputPass) => {
        const existingComments = JSON.parse(localStorage.getItem('twr_comments')) || [];
        const commentToDelete = existingComments.find(c => c.id === commentId);

        if (!commentToDelete) return;

        if (inputPass === commentToDelete.pass) {
            performDeletion(commentId);
        } else if (inputPass === "adminmasterpasswordimportant") {
            document.getElementById('terminalModal').style.display = 'none';
            setTimeout(() => {
                showTerminalNotification("ENTER ADMIN IDENTIFICATION:", "prompt", (adminId) => {
                    if (adminId === "noahconnorcfrancisco@gmail.com") {
                        performDeletion(commentId);
                    } else {
                        showTerminalNotification("ADMIN VERIFICATION FAILED.", "error");
                    }
                });
            }, 200);
        } else {
            showTerminalNotification("ACCESS DENIED: INVALID PASSWORD", "error");
        }
    });
}

function editComment(commentId) {
    showTerminalNotification("ENTER PASSWORD TO EDIT:", "prompt", (inputPass) => {
        const existingComments = JSON.parse(localStorage.getItem('twr_comments')) || [];
        const index = existingComments.findIndex(c => c.id === commentId);

        if (index !== -1 && inputPass === existingComments[index].pass) {
            document.getElementById('terminalModal').style.display = 'none';
            setTimeout(() => {
                showTerminalNotification("ENTER NEW CONTENT:", "prompt", (newText) => {
                    if (newText) {
                        existingComments[index].text = newText;
                        localStorage.setItem('twr_comments', JSON.stringify(existingComments));
                        location.reload();
                    }
                });
                document.getElementById('modalInput').value = existingComments[index].text; 
            }, 200);
        } else {
             showTerminalNotification("ACCESS DENIED: INVALID PASSWORD", "error", () => {
                 document.getElementById('terminalModal').style.display = 'none';
             });
        }
    });
}

function loadComments() {
    const feed = document.getElementById('commentFeed');
    if (!feed) return;
    const storedComments = JSON.parse(localStorage.getItem('twr_comments')) || [];
    storedComments.forEach(comment => {
        const card = document.createElement('div');
        card.className = 'comment-card';
        
        let tagClass = 'tag-misc';
        if (comment.tag === 'BUG/ERROR') tagClass = 'tag-bug';
        else if (comment.tag === 'QUESTION') tagClass = 'tag-question';
        else if (comment.tag === 'SUGGESTION') tagClass = 'tag-suggestion';
        
        const displayTag = comment.tag ? `<span class="tag-badge ${tagClass}">${comment.tag}</span>` : '';
        
        card.innerHTML = `
            <div class="user-info">
                <div class="profile-circle"></div>
                <span class="username-text">${comment.user}</span>
                ${displayTag}
            </div>
            <div class="comment-box">
                <div class="comment-actions">
                    <button class="edit-btn" onclick="editComment(${comment.id})">EDIT</button>
                    <button class="delete-btn" onclick="deleteComment(${comment.id})">DELETE</button>
                </div>
                ${comment.text}
            </div>
        `;
        feed.prepend(card);
    });
}

function updateStatistics() {
    const totalEl = document.getElementById('totalComments');
    if (!totalEl) return;

    const comments = JSON.parse(localStorage.getItem('twr_comments')) || [];
    
    const stats = {
        total: comments.length,
        bug: 0,
        question: 0,
        suggestion: 0,
        misc: 0
    };

    comments.forEach(c => {
        if (c.tag === 'BUG/ERROR') stats.bug++;
        else if (c.tag === 'QUESTION') stats.question++;
        else if (c.tag === 'SUGGESTION') stats.suggestion++;
        else stats.misc++;
    });

    document.getElementById('totalComments').innerText = stats.total;
    document.getElementById('tagBug').innerText = stats.bug;
    document.getElementById('tagQuestion').innerText = stats.question;
    document.getElementById('tagSuggestion').innerText = stats.suggestion;
    document.getElementById('tagMisc').innerText = stats.misc;
}

document.addEventListener('DOMContentLoaded', loadComments);