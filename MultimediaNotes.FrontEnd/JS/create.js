import { POSTAnnotation } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value.trim();
    const reminder = document.getElementById("reminder").value;

    if (!title || !content) return alert("Preencha todos os campos obrigatórios.");

    const anotacao = {
      title,
      content,
      priority: parseInt(priority),
      category,
      reminder,
      userId: 1 // ID fixo provisório
    };

    console.log("Payload enviado:", JSON.stringify(anotacao));

    try {
      await POSTAnnotation("http://localhost:5145/api/Annotation", anotacao);
      alert("Anotação salva com sucesso!");
      form.reset();
      window.location.href = "notes.html";
    } catch {
      alert("Erro ao salvar a anotação. Tente novamente.");
    }
  });
});

