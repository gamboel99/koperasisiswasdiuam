document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  let user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;

  if(user === 'admin' && pass === 'admin123'){
    window.location.href = 'admin.html';
  } else if(user === 'kasir' && pass === 'kasir123'){
    window.location.href = 'kasir.html';
  } else {
    document.getElementById('error').innerText = 'Username atau Password salah!';
  }
});
