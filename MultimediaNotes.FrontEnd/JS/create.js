document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value.trim();
    const reminder = document.getElementById("reminder").value;

    if (!title || !content) return alert("Preencha todos os campos obrigatórios.");

    const anotacao = {
      id: Date.now(),
      title,
      content,
      priority,
      category,
      reminder
    };

    const notasSalvas = JSON.parse(localStorage.getItem("anotacoes")) || [];
    notasSalvas.push(anotacao);
    localStorage.setItem("anotacoes", JSON.stringify(notasSalvas));

    alert("Anotação salva com sucesso!");
    form.reset();
    window.location.href = "notes.html"; // redireciona para lista
  });
});
