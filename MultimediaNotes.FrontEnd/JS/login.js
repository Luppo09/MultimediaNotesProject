import authService from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
  // Redirecionar se já estiver logado
  if (authService.isAuthenticated()) {
    window.location.href = "notes.html";
    return;
  }

  const form = document.getElementById("loginForm");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
      alert("Preencha todos os campos.");
      return;
    }
    
    const result = await authService.login(email, password);
    
    if (result.success) {
      alert("Login realizado com sucesso!");
      window.location.href = "notes.html";
    } else {
      alert("Falha no login: " + result.message);
    }
  });
});