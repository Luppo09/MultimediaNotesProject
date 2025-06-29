/* ========================================================
   Funções utilitárias declaradas ANTES do DOMContentLoaded
======================================================== */

/* --- Excluir nota ------------------------------------- */
function excluirNota(id) {
  console.log("Excluindo nota com id:", id);           // <-- depuração
  let anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];
  anotacoes = anotacoes.filter(n => Number(n.id) !== Number(id));
  localStorage.setItem("anotacoes", JSON.stringify(anotacoes));
  location.reload();                                   // recarrega a lista
}

/* --- Abrir modal de edição ---------------------------- */
function abrirEdicao(id) {
  const anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];
  const nota = anotacoes.find(n => Number(n.id) === Number(id));
  if (!nota) return;

  // Preenche campos
  document.getElementById("editId").value       = nota.id;
  document.getElementById("editTitle").value    = nota.title;
  document.getElementById("editContent").value  = nota.content;
  document.getElementById("editCategory").value = nota.category || "";
  document.getElementById("editReminder").value = nota.reminder || "";
  document.getElementById("editPriority").value = nota.priority;

  const modal = document.getElementById("editModal");
  modal.classList.remove("hidden");
  modal.classList.add("open");
}

/* --- Fechar modal (usado em cancelar e salvar) -------- */
function fecharModal() {
  const modal    = document.getElementById("editModal");
  const content  = modal.querySelector(".modal-content");

  modal.classList.add("closing");

  // garante que só executa quando a animação da saída terminar
  content.addEventListener(
    "animationend",
    () => {
      modal.classList.add("hidden");
      modal.classList.remove("open", "closing");
    },
    { once: true }
  );
}

/* ========================================================
   Fluxo principal
======================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const notesContainer = document.getElementById("notesContainer");
  let anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];

  /* ---------- renderização inicial ---------- */
  if (anotacoes.length === 0) {
    notesContainer.innerHTML = "<p>Nenhuma anotação cadastrada ainda.</p>";
    return;
  }

  anotacoes.forEach(nota => {
    const div = document.createElement("div");
    div.className = "note";
    div.dataset.priority = nota.priority;
    div.innerHTML = `
      <h3>${nota.title}</h3>
      <p>${nota.content}</p>
      <p><strong>Categoria:</strong> ${nota.category || "Nenhuma"}</p>
      ${
        nota.reminder
          ? `<p><strong>Lembrete:</strong> ${new Date(
              nota.reminder
            ).toLocaleString()}</p>`
          : ""
      }
      <button class="delete-btn" data-id="${nota.id}">Excluir</button>
      <button class="edit-btn"   data-id="${nota.id}">Editar</button>
    `;
    notesContainer.appendChild(div);
  });

  /* ---------- EXCLUIR / EDITAR ---------- */
  notesContainer.addEventListener("click", e => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains("delete-btn")) {
      excluirNota(id);
    }
    if (e.target.classList.contains("edit-btn")) {
      abrirEdicao(id);
    }
  });

  /* ---------- cancelar edição ---------- */
  document
    .getElementById("cancelEdit")
    .addEventListener("click", fecharModal);

  /* ---------- salvar edição ---------- */
  document.getElementById("editForm").addEventListener("submit", e => {
    e.preventDefault();

    const id = parseInt(document.getElementById("editId").value);
    const notaEditada = {
      title:     document.getElementById("editTitle").value,
      content:   document.getElementById("editContent").value,
      category:  document.getElementById("editCategory").value,
      reminder:  document.getElementById("editReminder").value,
      priority:  document.getElementById("editPriority").value
    };

    anotacoes = anotacoes.map(n =>
      Number(n.id) === Number(id) ? { ...n, ...notaEditada } : n
    );

    localStorage.setItem("anotacoes", JSON.stringify(anotacoes));
    fecharModal();
    location.reload();   // mostra a lista atualizada
  });
});
