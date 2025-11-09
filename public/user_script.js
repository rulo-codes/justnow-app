document.getElementById('logoutBtn').addEventListener('click', async () => {
    const res = await fetch('/logout', { method: 'POST' });
    if (res.ok) {
        window.location.href = '/index.html';
    } else {
        alert('Error logging out.');
    }
});

document.getElementById('diary_post').addEventListener('click', async () => {
    const diaryInput = document.getElementById('diary_input').value;

    if(!diaryInput.trim()) return alert("Please write something");

    const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({diaryInput})
    });

    const data = await res.json();
    if(data.success){
        alert('Diary Posted!');
        document.getElementById('diary_input') = "";
    } else {
        alert('Failed to post.')
    }
});

async function loadDiaries(){
    const res = await fetch('/api/posts');
    const diaries = await res.json();

    const container = documents.getElementById('diaries');
    container.innerHtml = diaries.map(i = `<p>${i.content}</p>`).join('');
};

const user = localStorage.getItem('username');
if (user) document.getElementById('userName').textContent = `${user}`;