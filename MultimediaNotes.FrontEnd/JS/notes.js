// notes.js - Atualizado para usar autenticação
import { GETAnnotationsByUserId, PUTAnnotation, DELETEAnnotation, GETAnnotationById } from "./api.js";
import authService from "./auth.js";

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

    if (!nota) {
      alert("Erro ao carregar anotação para edição.");
      return;
    }

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
    console.error("Erro ao carregar anotação:", error);
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
  // Verificar autenticação
  if (!authService.requireAuth()) {
    return;
  }

  const user = authService.getUser();
  const notesContainer = document.getElementById("notesContainer");
  const header = document.querySelector('header');

  try {
    // Buscar anotações do usuário específico
    //const userId = user ? user.id : 1; // Fallback para ID 1
    const user = authService.getUser();

    if (!user || !user.id) {
      alert("Erro: usuário não autenticado. Faça login novamente.");
      authService.logout();
      return;
    }

    const userId = user.id;

    const apiData = await GETAnnotationsByUserId("http://localhost:5145/api/Annotation", userId);
    
    let anotacoes = [];
    
    if (apiData) {
      // Verificar se é um array direto ou se tem $values
      anotacoes = apiData.$values || apiData || [];
    }

    /* ---------- Renderização inicial ---------- */
    if (anotacoes.length === 0) {
      notesContainer.innerHTML = "<p>Nenhuma anotação cadastrada ainda.</p>";
      return;
    }

    // Ordenar por prioridade (alta para baixa)
    anotacoes.sort((a, b) => b.priority - a.priority);

    anotacoes.forEach(nota => {
      const div = document.createElement("div");
      div.className = "note";
      div.dataset.priority = nota.priority;
      
      const priorityText = {
        1: 'Baixa',
        2: 'Média', 
        3: 'Alta'
      };

      div.innerHTML = `
        <h3>${nota.title}</h3>
        <p>${nota.content}</p>
        <p><strong>Categoria:</strong> ${nota.category || "Nenhuma"}</p>
        <p><strong>Prioridade:</strong> <span class="priority-${nota.priority}">${priorityText[nota.priority] || 'Não definida'}</span></p>
        ${nota.reminder
          ? `<p><strong>Lembrete:</strong> ${new Date(nota.reminder).toLocaleString('pt-BR')}</p>`
          : ""
        }
        <div class="note-actions">
          <button class="edit-btn" data-id="${nota.id}">Editar</button>
          <button class="delete-btn" data-id="${nota.id}">Excluir</button>
        </div>
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

    /* ---------- Cancelar edição ---------- */
    document.getElementById("cancelEdit").addEventListener("click", fecharModal);

    /* ---------- Salvar edição ---------- */
    document.getElementById("editForm").addEventListener("submit", async e => {
      e.preventDefault();

      const id = parseInt(document.getElementById("editId").value);
      const notaEditada = {
        id,
        title: document.getElementById("editTitle").value.trim(),
        content: document.getElementById("editContent").value.trim(),
        category: document.getElementById("editCategory").value.trim() || null,
        reminder: document.getElementById("editReminder").value || null,
        priority: parseInt(document.getElementById("editPriority").value),
        userId: userId
      };

      const submitButton = e.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Salvando...';

      try {
        const updated = await PUTAnnotation("http://localhost:5145/api/Annotation", notaEditada);
        
        if (updated) {
          alert("Anotação atualizada com sucesso!");
          fecharModal();
          location.reload();
        } else {
          alert("Erro ao salvar alterações. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro ao atualizar anotação:", error);
        alert("Erro ao salvar alterações. Tente novamente.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar Alterações';
      }
    });

  } catch (error) {
    console.error("Erro ao carregar anotações:", error);
    notesContainer.innerHTML = `<p>Erro ao carregar anotações. <button onclick="location.reload()">Tentar novamente</button></p>`;
  }
});