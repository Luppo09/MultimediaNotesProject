// create.js - Atualizado para usar autenticação
import { POSTAnnotation } from "./api.js";
import authService from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticação
  if (!authService.requireAuth()) {
    return;
  }

  /* --- Realizar LOGOUT */
  function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
      authService.logout();
    }
  };

  //Realizar LOGOUT
  document.getElementById("logoutButton").addEventListener("click", logout);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value.trim();
    const reminder = document.getElementById("reminder").value;

    if (!title || !content) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    // Usar o ID do usuário autenticado
    const user = authService.getUser();

    if (!user || !user.id) {
      alert("Erro: usuário não autenticado. Faça login novamente.");
      authService.logout();
      return;
    }

    const userId = user.id;

    //const userId = user ? user.id : 1; // Fallback para ID 1 se não houver dados do usuário

    const anotacao = {
      title,
      content,
      priority: parseInt(priority),
      category: category || null,
      reminder: reminder || null,
      userId: userId
    };

    console.log("Payload enviado:", JSON.stringify(anotacao));

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';

    try {
      await POSTAnnotation("http://localhost:5145/api/Annotation", anotacao);
      alert("Anotação salva com sucesso!");
      form.reset();
      window.location.href = "notes.html";
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert("Erro ao salvar a anotação. Tente novamente.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Salvar';
    }




  });
});