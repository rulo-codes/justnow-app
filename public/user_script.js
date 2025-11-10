document.getElementById('logoutBtn').addEventListener('click', async () => {
  const res = await fetch('/logout', { method: 'POST' });
  if (res.ok) {
    window.location.href = '/index.html';
  } else {
    alert('Error logging out.');
  }
});

document.getElementById('diary_post').addEventListener('click', async (e) => {
  e.preventDefault();
  const diaryInput = document.getElementById('diary_input').value;

  if (!diaryInput.trim()) return alert("Please write something");

  const res = await fetch('/api/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ diaryContent: diaryInput })
  });

  const data = await res.json();
  if (!data.success) {
    alert('Failed to post.');
  } else {
    alert('Diary Posted!');
    document.getElementById('diary_input').value = "";
    loadDiaries();
  }
});

async function loadDiaries() {
  try {
    const res = await fetch('/api/posts');
    const diaries = await res.json();
    const container = document.getElementById('diaries');
    container.innerHTML = diaries.map(i => `<p>${i.content}</p>`).join('');
  } catch (err) {
    console.error('Error loading diaries:', err);
  }
}

const user = localStorage.getItem('username');
if (user) document.getElementById('userName').textContent = `${user}`;

loadDiaries();
