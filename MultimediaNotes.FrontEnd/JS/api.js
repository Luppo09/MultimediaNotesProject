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
}

export { GETAnnotation, POSTAnnotation };
