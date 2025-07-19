/* ========================================================
   Funções utilitárias declaradas ANTES do DOMContentLoaded
======================================================== */
import { GETAnnotation, PUTAnnotation, DELETEAnnotation, GETAnnotationById } from "./api.js";

/* --- Excluir nota via API (DELETE) ------------ */
async function excluirNota(id) {
  const confirmacao = confirm("Tem certeza que deseja excluir esta anotação?");
  if (!confirmacao) return;

  try {
    const sucesso = await DELETEAnnotation("http://localhost:5145/api/Annotation", id);

    if (sucesso) {
      alert("Anotação excluída com sucesso.");
      location.reload();
    } else {
      alert("Erro ao excluir anotação. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao excluir anotação:", error);
    alert("Erro ao excluir anotação.");
  }
}

/* --- Abrir modal de edição via API ------------ */
async function abrirEdicao(id) {
  try {
    const nota = await GETAnnotationById("http://localhost:5145/api/Annotation", id);

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
  } catch (error) {
    alert("Erro ao carregar anotação para edição.");
  }
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
