import authService from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

   if (!name || !email || !password || !confirmPassword){
      alert("Preencha todos os campos.");
      return;
    }

    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      console.error('Senhas não coincidem');
      alert("As senhas não coincidem.");
      confirmPasswordElement.focus();
      return;
    }

    try {
      const result = await authService.register(name, email, password, confirmPassword);

      if (result.success) {
        alert("Conta criada com sucesso!");
        window.location.href = "login.html";
      } else {
        alert("Erro ao criar conta: " + result.message);
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      alert("Erro ao criar conta. Tente novamente.");
    }
  });
});
