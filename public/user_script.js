const errorMessage = document.getElementById("error_message");

function toggleWindow(id){
  const div = document.getElementById(id);
  if(div.classList.contains("open-window")){
    div.classList.remove("open-window");
  }else {
    div.classList.add("open-window");
  }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  const res = await fetch('/logout', { method: 'POST' });
  if (res.ok) {
    window.location.href = '/index.html';
  } else {
    alert('Error logging out.');
  }
});

document.getElementById('toggleDiaryBtn').addEventListener('click', () => {
  toggleWindow("diary_add");
});

document.getElementById('diary_cancel_btn').addEventListener('click', () => {
  toggleWindow("diary_add");
});

document.getElementById('diary_post_btn').addEventListener('click', async (e) => {
  e.preventDefault();
  const diaryInput = document.getElementById('diary_input').value;

  if (!diaryInput.trim()){ 
    errorMessage.style.color = '#df3838';
    return errorMessage.textContent = "Please write something."
  };

  const res = await fetch('/api/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ diaryContent: diaryInput })
  });

  const data = await res.json();
  if (!data.success) {
    errorMessage.textContent = "Failed to post." 
  } else {
    errorMessage.textContent = "Entry saved."
    errorMessage.style.color = '#178a39';
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
    errorMessage.textContent = "Failed to erase entry.";
  } else {
    errorMessage.textContent = "Entry erased.";
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
        <div class="diary_item_header"><h3>${date}  |  ${time}</h3><button id="delete_diary_btn" onclick="deleteDiary(${i.id})" title="Erase diary entry."><i class="solar--eraser-bold diary_delete_btn"></i></button></div>
        <div class="line"></div>
        <p>Just now... <span>${i.content}</span></p>
      </div>`
      )
    }).join('');
  } catch (err) {
    console.error('Error loading diaries:', err);
    errorMessage.textContent = "Something went wrong.";
  }
}

let themeSelectedId = 1;

document.getElementById('user_theme').addEventListener('click', async () => {
  const root = document.documentElement;
  const res = await fetch('/api/theme');
  const theme = await res.json();
  
  if(themeSelectedId >= theme.length){
    themeSelectedId = 1;
  }else {
    themeSelectedId += 1;
  }

  console.log(themeSelectedId)
  const target = theme.find(i => i.id === themeSelectedId);
  root.style.setProperty('--theme-primary-color', target.primaryColor);
  root.style.setProperty('--theme-secondary-color', target.secondaryColor);
  document.querySelector('.bg-pattern').style.backgroundImage = `var(${target.pattern}), linear-gradient(var(--theme-primary-color), var(--theme-primary-color))`;
});;

const user = localStorage.getItem('username');
if (user) document.getElementById('userName').textContent = `${user}`;

loadDiaries();
