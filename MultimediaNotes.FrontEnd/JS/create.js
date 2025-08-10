import { POSTAnnotation } from "./api.js";
import authService from "./auth.js";
import { uploadMediaFile, validateFile, createFilePreview } from "./mediaFileApi.js";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticação
  if (!authService.requireAuth()) {
    return;
  }

  const form = document.getElementById("form");
  const fileInput = document.getElementById("mediaFiles");
  const filePreviewContainer = document.getElementById("filePreviewContainer");
  let selectedFiles = [];

  /* --- Gerenciar seleção de arquivos --- */
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelection);
  }

  function handleFileSelection(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(async (file) => {
      try {
        validateFile(file);
        
        // Verificar se o arquivo já foi selecionado
        if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
          selectedFiles.push(file);
          await displayFilePreview(file); 
        }
      } catch (error) {
        alert(`Erro no arquivo "${file.name}": ${error.message}`);
      }
    });

    // Limpar input para permitir selecionar o mesmo arquivo novamente se houver necessidade
    e.target.value = '';
  }

  async function displayFilePreview(file) {
    const previewContainer = document.createElement('div');
    previewContainer.className = 'file-preview-item';
    previewContainer.dataset.fileName = file.name;

    // Aguardar a criação do preview (agora é assíncrona)
    const preview = await createFilePreview(file);
    
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-file-btn';
    removeButton.textContent = '×';
    removeButton.onclick = () => removeFilePreview(file.name);

    previewContainer.appendChild(preview);
    previewContainer.appendChild(removeButton);
    
    if (filePreviewContainer) {
      filePreviewContainer.appendChild(previewContainer);
    }
  }

  function removeFilePreview(fileName) {
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
    
    const previewItem = filePreviewContainer.querySelector(`[data-file-name="${fileName}"]`);
    if (previewItem) {
      previewItem.remove();
    }
  }

  /* --- Realizar LOGOUT */
  function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
      authService.logout();
    }
  }

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
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';

    try {
      // 1. Criar a anotação 
      const createdAnnotation = await POSTAnnotation("http://localhost:5145/api/Annotation", anotacao);
      console.log("Anotação criada:", createdAnnotation);

      // 2. Fazer upload dos arquivos se houver
      if (selectedFiles.length > 0) {
        submitButton.textContent = 'Enviando arquivos...';
        
        const uploadPromises = selectedFiles.map(async (file, index) => {
          try {
            console.log(`Fazendo upload do arquivo ${index + 1}/${selectedFiles.length}: ${file.name}`);
            return await uploadMediaFile(createdAnnotation.id, file);
          } catch (error) {
            console.error(`Erro no upload do arquivo ${file.name}:`, error);
            throw new Error(`Falha no upload do arquivo "${file.name}": ${error.message}`);
          }
        });

        await Promise.all(uploadPromises);
        console.log("Todos os arquivos foram enviados com sucesso");
      }

      alert("Anotação salva com sucesso!");
      form.reset();
      selectedFiles = [];
      if (filePreviewContainer) {
        filePreviewContainer.innerHTML = '';
      }
      window.location.href = "notes.html";
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao salvar: ${error.message || error}`);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});