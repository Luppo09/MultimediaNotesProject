import authService from './auth.js';

async function GETAnnotation(url) {
  try {
    const response = await authService.authenticatedFetch(url);

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }

    const annotations = await response.json();
    console.log(annotations);
    return annotations;
  } catch (error) {
    console.error("Erro ao buscar anotações:", error);
    throw error;
  }
};

async function GETAnnotationById(url, id) {
  try {
    const response = await authService.authenticatedFetch(`${url}/${id}`);
    
    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    console.log(`response: ${response}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar anotação por ID:", error);
    return null;
  }
};

async function GETAnnotationsByUserId(url, userId) {
  try {
    const response = await authService.authenticatedFetch(`${url}/user/${userId}`);
    
    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar anotações do usuário:", error);
    return null;
  }
};

async function POSTAnnotation(url, anotacao) {
  try {
    const response = await authService.authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(anotacao)
    });

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro ao salvar: ${response.status} - ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log("Anotação criada:", resultado);
    return resultado;
  } catch (error) {
    console.error("Erro ao criar anotação:", error);
    throw error;
  }
};

async function PUTAnnotation(url, annotationData) {
  try {
    const response = await authService.authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(annotationData)
    });

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro ao atualizar: ${response.status} - ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao editar anotação:", error);
    return false;
  }
};

async function DELETEAnnotation(url, id) {
  try {
    const response = await authService.authenticatedFetch(`${url}/${id}`, {
      method: "DELETE"
    });

    if (!response) {
      throw new Error('Erro de autenticação');
    }

    if (!response.ok) {
      throw new Error(`Erro ao excluir: ${response.status} - ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir anotação:", error);
    return false;
  }
};


export {
  GETAnnotation,
  GETAnnotationById,
  GETAnnotationsByUserId,
  POSTAnnotation,
  PUTAnnotation,
  DELETEAnnotation
};
