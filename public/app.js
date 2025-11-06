document.getElementById('loginInput').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new URLSearchParams(new FormData(e.target)).toString();

  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });

  const data = await res.json().catch(() => null);

  if (data?.success) {
    localStorage.setItem('username', data.username);
    window.location.href = '/user_page.html';
  } else {
    document.getElementById('loginError').textContent =
      data?.error || 'Login failed.';
  }
});

document.getElementById('registerInput').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(new FormData(e.target)).toString();
    const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
        body: formData,
    });
    const data = await res.json().catch(() => null);
    if(data?.error){
        document.getElementById('registerError').textContent = data.error;
    } else {
        toggleForm('login_form')
        document.getElementById('loginError').textContent = "Registration Success! Please Login.";
    }
})
//functions go here V
function toggleForm(formId){
    document.querySelectorAll(".form_box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}


