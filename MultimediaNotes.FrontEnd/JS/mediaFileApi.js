// mediaFileApi.js - Funções para gerenciar arquivos de mídia com autenticação
import authService from './auth.js';

// Buscar arquivos por anotação
async function getMediaFilesByAnnotation(annotationId) {
  try {
    const response = await authService.authenticatedFetch(`http://localhost:5145/api/MediaFile/annotation/${annotationId}`);

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro ao buscar arquivos: ${response.status}`);
    }

    const files = await response.json();
    return files.$values || files || [];
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    return [];
  }
}

// Fazer upload de arquivo de mídia - VERSÃO CORRIGIDA
async function uploadMediaFile(annotationId, file) {
  try {
    console.log(`Iniciando upload do arquivo: ${file.name}`);
    console.log(`Tamanho: ${formatFileSize(file.size)}, Tipo: ${file.type}`);

    const formData = new FormData();
    formData.append('File', file);
    formData.append('AnnotationId', annotationId.toString());

    // Debug: verificar o conteúdo do FormData
    console.log('FormData criado:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }

    const headers = {
      'Authorization': `Bearer ${authService.getToken()}`
    };

    console.log('Headers da requisição:', headers);

    const response = await fetch('http://localhost:5145/api/MediaFile/upload', {
      method: 'POST',
      body: formData,
      headers: headers
    });

    console.log(`Status da resposta: ${response.status}`);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (response.status === 401) {
      console.error('Token inválido ou expirado');
      authService.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      try {
        const errorText = await response.text();
        console.error('Resposta de erro:', errorText);
        
        // Tentar fazer parse como JSON se possível
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.title || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (textError) {
        console.error('Erro ao ler resposta de erro:', textError);
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Upload bem-sucedido:', result);
    return result;

  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    
    // Melhorar mensagens de erro para o usuário
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conexão com o servidor. Verifique sua conexão.');
    } else if (error.message.includes('413')) {
      throw new Error('Arquivo muito grande. Reduza o tamanho e tente novamente.');
    } else if (error.message.includes('415')) {
      throw new Error('Tipo de arquivo não suportado.');
    }
    
    throw error;
  }
}

// Deletar arquivo de mídia
async function deleteMediaFile(fileId) {
  try {
    const response = await authService.authenticatedFetch(`http://localhost:5145/api/MediaFile/${fileId}`, {
      method: 'DELETE'
    });

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro ao deletar arquivo: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
}

// Obter URL do arquivo
function getMediaFileUrl(fileId) {
  return `http://localhost:5145/api/MediaFile/${fileId}`;
}

// Buscar arquivo com autenticação e retornar blob URL
async function getAuthenticatedMediaUrl(fileId) {
  try {
    const response = await authService.authenticatedFetch(`http://localhost:5145/api/MediaFile/${fileId}`);
    
    if (!response || !response.ok) {
      throw new Error('Erro ao buscar arquivo');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Erro ao buscar arquivo autenticado:', error);
    return null;
  }
}

// Validar arquivo antes do upload 
function validateFile(file) {
  console.log(`Validando arquivo: ${file.name}, tamanho: ${file.size}, tipo: ${file.type}`);
  
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    // Imagens
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
    // Áudios
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/m4a'
  ];

  if (!file.name || file.name.trim() === '') {
    throw new Error('Nome do arquivo inválido');
  }

  if (file.size === 0) {
    throw new Error('Arquivo vazio não é permitido');
  }

  if (file.size > maxSize) {
    throw new Error(`Arquivo muito grande (${formatFileSize(file.size)}). Máximo permitido: ${formatFileSize(maxSize)}`);
  }

  if (!file.type || !allowedTypes.includes(file.type)) {
    console.warn(`Tipo de arquivo não reconhecido: ${file.type}`);
    
    // Verificar pela extensão como fallback
    const extension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp3', 'wav', 'ogg', 'm4a', 'mp4'];
    
    if (!allowedExtensions.includes(extension)) {
      throw new Error('Tipo de arquivo não suportado. Permitidos: imagens (JPG, PNG, GIF, BMP, WEBP) e áudios (MP3, WAV, OGG, M4A)');
    }
  }

  console.log('Arquivo validado com sucesso');
  return true;
}

// Formatar tamanho do arquivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Obter tipo de arquivo para exibição
function getFileTypeDisplay(mimeType) {
  if (!mimeType) return 'Arquivo';
  if (mimeType.startsWith('image/')) return 'Imagem';
  if (mimeType.startsWith('audio/')) return 'Áudio';
  return 'Arquivo';
}

// Criar preview do arquivo 
async function createFilePreview(file, fileData = null) {
  const container = document.createElement('div');
  container.className = 'file-preview';
  
  const fileName = fileData ? fileData.fileName : file.name;
  const fileSize = fileData ? fileData.fileSize : file.size;
  const mimeType = fileData ? fileData.mimeType : file.type;
  const fileId = fileData ? fileData.id : null;

  console.log(`Criando preview para: ${fileName}, tipo: ${mimeType}`);

  if (mimeType && mimeType.startsWith('image/')) {
    const img = document.createElement('img');
    img.alt = fileName;
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '5px';
    img.style.cursor = 'pointer';
    
    if (fileData && fileId) {
      // Usar autenticação para arquivos do servidor
      try {
        const blobUrl = await getAuthenticatedMediaUrl(fileId);
        if (blobUrl) {
          img.src = blobUrl;
          img.onload = function() {
            console.log('Imagem carregada com sucesso:', fileName);
          };
          // Adicionar listener para expandir imagem ao clicar
          img.onclick = function() {
            window.open(blobUrl, '_blank');
          };
        } else {
          throw new Error('Não foi possível carregar a imagem');
        }
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        return createErrorPreview(fileName, fileSize, mimeType, 'Erro ao carregar imagem');
      }
    } else if (file) {
      // Para arquivos locais (preview antes do upload)
      const blobUrl = URL.createObjectURL(file);
      img.src = blobUrl;
      img.onclick = function() {
        window.open(blobUrl, '_blank');
      };
      
      // Limpar URL quando não precisar mais
      img.onload = function() {
        // URL será limpa quando o container for removido
      };
    }
    
    img.onerror = function() {
      console.error('Erro ao exibir imagem:', fileName);
      img.style.display = 'none';
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Erro ao exibir imagem';
      errorMsg.style.color = '#999';
      errorMsg.style.fontStyle = 'italic';
      container.appendChild(errorMsg);
    };
    
    container.appendChild(img);
    
  } else if (mimeType && mimeType.startsWith('audio/')) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.style.width = '100%';
    audio.style.maxWidth = '300px';
    
    if (fileData && fileId) {
      // Para arquivos do servidor, usar autenticação
      try {
        const blobUrl = await getAuthenticatedMediaUrl(fileId);
        if (blobUrl) {
          audio.src = blobUrl;
        } else {
          throw new Error('Não foi possível carregar o áudio');
        }
      } catch (error) {
        console.error('Erro ao carregar áudio:', error);
        return createErrorPreview(fileName, fileSize, mimeType, 'Erro ao carregar áudio');
      }
    } else if (file) {
      // Para arquivos locais
      audio.src = URL.createObjectURL(file);
    }
    
    audio.onerror = function() {
      console.error('Erro ao reproduzir áudio:', fileName);
    };
    
    container.appendChild(audio);
  } else {
    // Fallback para tipos não reconhecidos pelo sistema
    const placeholder = document.createElement('div');
    placeholder.innerHTML = `<p>📎 ${fileName}</p>`;
    placeholder.style.padding = '20px';
    placeholder.style.textAlign = 'center';
    placeholder.style.backgroundColor = '#f8f9fa';
    placeholder.style.border = '2px dashed #dee2e6';
    placeholder.style.borderRadius = '5px';
    placeholder.style.maxWidth = '200px';
    container.appendChild(placeholder);
  }

  const info = document.createElement('div');
  info.className = 'file-info';
  info.style.marginTop = '8px';
  info.style.fontSize = '0.9em';
  info.innerHTML = `
    <p><strong>${fileName}</strong></p>
    <p>${getFileTypeDisplay(mimeType)} - ${formatFileSize(fileSize)}</p>
  `;
  container.appendChild(info);

  return container;
}

// Criar preview de erro
function createErrorPreview(fileName, fileSize, mimeType, errorMessage) {
  const container = document.createElement('div');
  container.className = 'file-preview error';
  
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `<p>❌ ${fileName}</p><p><small>${errorMessage}</small></p>`;
  errorDiv.style.padding = '20px';
  errorDiv.style.textAlign = 'center';
  errorDiv.style.backgroundColor = '#fff5f5';
  errorDiv.style.border = '2px dashed #feb2b2';
  errorDiv.style.borderRadius = '5px';
  errorDiv.style.maxWidth = '200px';
  errorDiv.style.color = '#c53030';
  container.appendChild(errorDiv);
  
  const info = document.createElement('div');
  info.className = 'file-info';
  info.style.marginTop = '8px';
  info.style.fontSize = '0.9em';
  info.innerHTML = `
    <p><strong>${fileName}</strong></p>
    <p>${getFileTypeDisplay(mimeType)} - ${formatFileSize(fileSize)}</p>
  `;
  container.appendChild(info);
  
  return container;
}

export {
  uploadMediaFile,
  getMediaFilesByAnnotation,
  deleteMediaFile,
  getMediaFileUrl,
  getAuthenticatedMediaUrl,
  validateFile,
  formatFileSize,
  getFileTypeDisplay,
  createFilePreview
};