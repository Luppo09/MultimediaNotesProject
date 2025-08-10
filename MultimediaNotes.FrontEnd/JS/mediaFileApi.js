// mediaFileApi.js - Funções para gerenciar arquivos de mídia com autenticação para imagens
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

// Fazer upload de arquivo de mídia
async function uploadMediaFile(annotationId, file) {
  try {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('AnnotationId', annotationId);

    const response = await authService.authenticatedFetch('http://localhost:5145/api/MediaFile/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro no upload: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
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

// Buscar arquivo com autenticação e retornar blob URL, necessário para visualização da mídia antes do término do método POST
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
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    // Imagens
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
    // Áudios
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ];

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo permitido: 50MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Permitidos: imagens (JPG, PNG, GIF, BMP) e áudios (MP3, WAV, OGG, M4A)');
  }

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

  if (mimeType.startsWith('image/')) {
    const img = document.createElement('img');
    img.alt = fileName;
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '5px';
    
    if (fileData && fileId) {
      // Usar autenticação para arquivos do servidor
      try {
        const blobUrl = await getAuthenticatedMediaUrl(fileId);
        if (blobUrl) {
          img.src = blobUrl;
          img.onload = function() {
            console.log('Imagem carregada com sucesso:', fileName);
          };
        } else {
          throw new Error('Não foi possível carregar a imagem');
        }
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        // Fallback: mostrar placeholder
        const fallback = document.createElement('div');
        fallback.innerHTML = `<p>🖼️ ${fileName}</p><p><small>Erro ao carregar imagem</small></p>`;
        fallback.style.padding = '20px';
        fallback.style.textAlign = 'center';
        fallback.style.backgroundColor = '#f0f0f0';
        fallback.style.border = '2px dashed #ccc';
        fallback.style.borderRadius = '5px';
        fallback.style.maxWidth = '200px';
        fallback.style.maxHeight = '200px';
        container.appendChild(fallback);
        
        const info = document.createElement('div');
        info.className = 'file-info';
        info.innerHTML = `
          <p><strong>${fileName}</strong></p>
          <p>${getFileTypeDisplay(mimeType)} - ${formatFileSize(fileSize)}</p>
        `;
        container.appendChild(info);
        
        return container;
      }
    } else if (file) {
      // Para arquivos locais (preview antes do upload)
      img.src = URL.createObjectURL(file);
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
    
  } else if (mimeType.startsWith('audio/')) {
    const audio = document.createElement('audio');
    audio.controls = true;
    
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
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Erro ao carregar áudio';
        errorMsg.style.color = '#999';
        container.appendChild(errorMsg);
      }
    } else if (file) {
      // Para arquivos locais
      audio.src = URL.createObjectURL(file);
    }
    
    audio.onerror = function() {
      console.error('Erro ao reproduzir áudio:', fileName);
    };
    
    container.appendChild(audio);
  }

  const info = document.createElement('div');
  info.className = 'file-info';
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