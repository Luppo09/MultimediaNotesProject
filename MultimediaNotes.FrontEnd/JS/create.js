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
  let isUploading = false;

  /* --- Gerenciar seleção de arquivos --- */
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelection);
  }

  async function handleFileSelection(e) {
    if (isUploading) {
      alert('Aguarde o upload atual finalizar antes de selecionar novos arquivos.');
      e.target.value = '';
      return;
    }

    const files = Array.from(e.target.files);
    console.log(`${files.length} arquivo(s) selecionado(s)`);
    
    for (const file of files) {
      try {
        console.log(`Processando arquivo: ${file.name}`);
        validateFile(file);
        
        // Verificar se o arquivo já foi selecionado (comparar nome e tamanho)
        const isDuplicate = selectedFiles.find(f => 
          f.name === file.name && 
          f.size === file.size && 
          f.type === file.type
        );
        
        if (isDuplicate) {
          console.log(`Arquivo duplicado ignorado: ${file.name}`);
          continue;
        }
        
        selectedFiles.push(file);
        console.log(`Arquivo adicionado à lista: ${file.name}`);
        
        await displayFilePreview(file);
        
      } catch (error) {
        console.error(`Erro no arquivo "${file.name}":`, error);
        alert(`Erro no arquivo "${file.name}": ${error.message}`);
      }
    }

    // Limpar input para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = '';
    
    console.log(`Total de arquivos selecionados: ${selectedFiles.length}`);
  }

  async function displayFilePreview(file) {
    try {
      const previewContainer = document.createElement('div');
      previewContainer.className = 'file-preview-item';
      previewContainer.dataset.fileName = file.name;

      // Aguardar a criação do preview (é assíncrona)
      const preview = await createFilePreview(file);
      
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-file-btn';
      removeButton.innerHTML = '×';
      removeButton.title = 'Remover arquivo';
      
      removeButton.onclick = (e) => {
        e.preventDefault();
        removeFilePreview(file.name);
      };

      previewContainer.appendChild(preview);
      previewContainer.appendChild(removeButton);
      
      if (filePreviewContainer) {
        filePreviewContainer.appendChild(previewContainer);
      }
      
      console.log(`Preview criado para: ${file.name}`);
      
    } catch (error) {
      console.error(`Erro ao criar preview para ${file.name}:`, error);
    }
  }

  function removeFilePreview(fileName) {
    console.log(`Removendo arquivo: ${fileName}`);
    
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
    
    const previewItem = filePreviewContainer.querySelector(`[data-file-name="${fileName}"]`);
    if (previewItem) {
      previewItem.remove();
      console.log(`Preview removido para: ${fileName}`);
    }
    
    console.log(`Total de arquivos após remoção: ${selectedFiles.length}`);
  }

  /* --- Realizar LOGOUT */
  function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
      authService.logout();
    }
  }

  // Realizar LOGOUT
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isUploading) {
      alert('Upload já em andamento. Aguarde!');
      return;
    }

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value.trim();
    const reminder = document.getElementById("reminder").value;

    if (!title || !content) {
      alert("Preencha todos os campos obrigatórios (título e conteúdo).");
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

    console.log("Dados da anotação:", anotacao);
    console.log(`Arquivos para upload: ${selectedFiles.length}`);

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Desabilitar o botão e mostrar progresso
    submitButton.disabled = true;
    submitButton.textContent = 'Salvando anotação...';
    isUploading = true;

    try {
      // 1. Criar a anotação primeiro
      console.log("Criando anotação...");
      const createdAnnotation = await POSTAnnotation("http://localhost:5145/api/Annotation", anotacao);
      console.log("Anotação criada com sucesso:", createdAnnotation);

      // 2. Fazer upload dos arquivos se houver
      if (selectedFiles.length > 0) {
        console.log(`Iniciando upload de ${selectedFiles.length} arquivo(s)...`);
        submitButton.textContent = `Enviando arquivos (0/${selectedFiles.length})...`;
        
        const uploadResults = [];
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          try {
            console.log(`Upload ${i + 1}/${selectedFiles.length}: ${file.name}`);
            submitButton.textContent = `Enviando arquivos (${i + 1}/${selectedFiles.length})...`;
            
            const uploadResult = await uploadMediaFile(createdAnnotation.id, file);
            uploadResults.push({ file: file.name, success: true, result: uploadResult });
            successCount++;
            
            console.log(`Upload concluído: ${file.name}`);
            
          } catch (error) {
            console.error(`Erro no upload do arquivo ${file.name}:`, error);
            uploadResults.push({ file: file.name, success: false, error: error.message });
            errorCount++;
          }
        }

        // Relatório de uploads
        console.log('Relatório de uploads:', uploadResults);
        
        if (errorCount > 0) {
          const errorFiles = uploadResults
            .filter(r => !r.success)
            .map(r => `- ${r.file}: ${r.error}`)
            .join('\n');
          
          const message = `Anotação salva, mas ${errorCount} arquivo(s) falharam no upload:\n\n${errorFiles}`;
          alert(message);
        } else {
          console.log("Todos os arquivos foram enviados com sucesso");
        }
      }

      alert("Anotação salva com sucesso!");
      
      // Limpar formulário
      form.reset();
      selectedFiles = [];
      if (filePreviewContainer) {
        filePreviewContainer.innerHTML = '';
      }
      
      // Redirecionar para a página de notas
      window.location.href = "notes.html";
      
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      
      let errorMessage = 'Erro ao salvar anotação: ';
      if (error.message) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Erro desconhecido';
      }
      
      alert(errorMessage);
      
    } finally {
      // Restaurar estado do botão
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      isUploading = false;
    }
  });
});