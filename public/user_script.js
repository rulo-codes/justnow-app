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

async function deleteDiary(diary_id){
  if(!diary_id) return alert("Diary not found");

  const res = await fetch('/api/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({diary_id})
  });

  const data = await res.json();
  if(!data.success){
    alert('Diary failed to delete.');
  } else {
    alert('Diary deleted.');
    loadDiaries();
  }
};

async function loadDiaries() {
  try {
    const res = await fetch('/api/posts');
    const diaries = await res.json();
    const container = document.getElementById('diaries');
    container.innerHTML = diaries.map(i => {
      const date = new Date(i.created_at).toLocaleDateString('en-US');
      const time = new Date(i.created_at).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
      return (
      `<div id=${i.id} class="diary_item">
        <div class="diary_item_header"><h3>${date}  |  ${time}</h3><button id="delete_diary_btn" onclick="deleteDiary(${i.id})">Delete</button></div>
        <div class="line"></div>
        <p>Just now... <span>${i.content}</span></p>
      </div>`
      )
    }).join('');
  } catch (err) {
    console.error('Error loading diaries:', err);
  }
}

const user = localStorage.getItem('username');
if (user) document.getElementById('userName').textContent = `${user}`;

loadDiaries();
