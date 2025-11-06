document.getElementById('logoutBtn').addEventListener('click', async () => {
    const res = await fetch('/logout', { method: 'POST' });
    if (res.ok) {
        window.location.href = '/index.html';
    } else {
        alert('Error logging out.');
    }
});

const user = localStorage.getItem('username');
if (user) document.getElementById('userName').textContent = `${user}`;