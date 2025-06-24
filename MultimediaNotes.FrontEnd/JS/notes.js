document.addEventListener("DOMContentLoaded", () => {
  const notesContainer = document.getElementById("notesContainer");
  const anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];

  if (anotacoes.length === 0) {
    notesContainer.innerHTML = "<p>Nenhuma anotação cadastrada.</p>";
    return;
  }

  anotacoes.forEach((nota) => {
    const div = document.createElement("div");
    div.className = "note";
    div.dataset.priority = nota.priority;

    div.innerHTML = `
      <h3>${nota.title}</h3>
      <p>${nota.content}</p>
      <p><strong>Categoria:</strong> ${nota.category || "Nenhuma"}</p>
      ${nota.reminder ? `<p><strong>Lembrete:</strong> ${new Date(nota.reminder).toLocaleString()}</p>` : ""}
    `;

    notesContainer.appendChild(div);
  });
});
