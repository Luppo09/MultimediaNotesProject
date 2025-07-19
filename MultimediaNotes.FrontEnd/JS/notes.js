/* ========================================================
   Funções utilitárias declaradas ANTES do DOMContentLoaded
======================================================== */
import { GETAnnotation, PUTAnnotation } from "./api.js";

/* --- Excluir nota (ainda só no localStorage) ------------ */
function excluirNota(id) {
  console.log("Excluindo nota com id:", id);
  let anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];
  anotacoes = anotacoes.filter(n => Number(n.id) !== Number(id));
  localStorage.setItem("anotacoes", JSON.stringify(anotacoes));
  location.reload();
}

/* --- Abrir modal de edição*/
function abrirEdicao(id) {
  const anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];
  const nota = anotacoes.find(n => Number(n.id) === Number(id));
  if (!nota) return;

  document.getElementById("editId").value = nota.id;
  document.getElementById("editTitle").value = nota.title;
  document.getElementById("editContent").value = nota.content;
  document.getElementById("editCategory").value = nota.category || "";
  document.getElementById("editReminder").value = nota.reminder
    ? new Date(nota.reminder).toISOString().slice(0, 16)
    : "";
  document.getElementById("editPriority").value = nota.priority;

  const modal = document.getElementById("editModal");
  modal.classList.remove("hidden");
  modal.classList.add("open");
}

/* --- Fechar modal de edição */
function fecharModal() {
  const modal = document.getElementById("editModal");
  const content = modal.querySelector(".modal-content");

  modal.classList.add("closing");

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
document.addEventListener("DOMContentLoaded", async () => {
  const notesContainer = document.getElementById("notesContainer");

  try {
    const apiData = await GETAnnotation("http://localhost:5145/api/Annotation");
    let anotacoes = apiData.$values || [];

    // Salva no localStorage para manter compatibilidade com o restante do código
    localStorage.setItem("anotacoes", JSON.stringify(anotacoes));

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
        ${nota.reminder
          ? `<p><strong>Lembrete:</strong> ${new Date(nota.reminder).toLocaleString()}</p>`
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
    document.getElementById("cancelEdit").addEventListener("click", fecharModal);

    /* ---------- salvar edição ---------- */
    document.getElementById("editForm").addEventListener("submit", async e => {
      e.preventDefault();

      const id = parseInt(document.getElementById("editId").value);
      const notaEditada = {
        id,
        title: document.getElementById("editTitle").value.trim(),
        content: document.getElementById("editContent").value.trim(),
        category: document.getElementById("editCategory").value.trim(),
        reminder: document.getElementById("editReminder").value || null,
        priority: parseInt(document.getElementById("editPriority").value),
        userId: 1 // Provisório
      };

      try {
        const updated = await PUTAnnotation("http://localhost:5145/api/Annotation", notaEditada);
        console.log("Anotação atualizada:", updated);
        fecharModal();
        location.reload();
      } catch (error) {
        console.error("Erro ao atualizar anotação:", error);
        alert("Erro ao salvar alterações. Tente novamente.");
      }
    });

  } catch (error) {
    console.error("Erro ao carregar anotações:", error);
    notesContainer.innerHTML = `<p>Erro ao carregar anotações da API.</p>`;
  }
});

