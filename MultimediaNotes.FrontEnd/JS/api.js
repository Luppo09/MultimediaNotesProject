async function GETAnnotation(url) {
  try {
    let response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }

    let annotations = await response.json();
    console.log(annotations);
    return annotations;
  } catch (error) {
    console.error("Erro ao buscar anotações:", error);
  }
};

async function GETAnnotationById(url, id) {
  try {
    const response = await fetch(`${url}/${id}`);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    console.log(`response: ${response}`)
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar anotação por ID:", error);
    return null;
  }
};

async function POSTAnnotation(url, anotacao) {
  {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(anotacao)
      });

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
  }
};

async function PUTAnnotation(url, annotationData) {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(annotationData)
    });

    if (!response.ok)
      throw new Error(`Erro ao atualizar: ${response.status} - ${response.statusText}`);

    return true;
  } catch (error) {
    console.error("Erro ao editar anotação:", error);
    return false;
  }
};

async function DELETEAnnotation(url, id) {
  try {
    const response = await fetch(`${url}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok)
      throw new Error(`Erro ao excluir: ${response.status} - ${response.statusText}`);

    return true;
  } catch (error) {
    console.error("Erro ao excluir anotação:", error);
    return false;
  }
};


export { GETAnnotation, GETAnnotationById, POSTAnnotation, PUTAnnotation, DELETEAnnotation };
