/*

******** Analisador Léxico *******
------ by Luiz Disarz, 2023 ------

Obs.: É necessária a conexão com a internet para acessar os frameworks utilizados
*/

const colors = ['primary', 'info','warning', 'danger', 'success', 'secondary']
const alfabeto = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const espaco = 32;
const apagar = 8;

let automatoProprieties = {
    'palavras': [],
    'automato': [],
    // Números do evento, para guiar o automato, q0, q1, q2, q3, ...
    'qTotal': 0,
}

let automatoWireframe = [
    []
];

/*
    Ativa Listeners para os inputs e botões da página
*/
$(document).ready(function() {
    // Clique para adicionar nova palavra
    $('#addWord').click(function(event) {
        event.preventDefault();

        // Recebe a palavra digitada
        let palavraElement = $('#addWordInput');
        let palavraNova = $('#addWordInput').val();

        // Caso palavra não exista no automato, adicionada ela na lista e no automato
        if (automatoProprieties.palavras.indexOf(palavraNova) < 0) {
            addWordToAutomato(palavraNova);

            // Gera o esqueleto que formará o automato, os estados e cada letra associada
            let maquete = [];

            for(let i = 0; i < automatoWireframe.length; i++){
                let tableCell = [];
                tableCell['qX'] = i;

                for(let j = a; j <= z; j++){
                    let letra = String.fromCharCode(j);

                    if(!(letra in automatoWireframe[i])){
                        tableCell[letra] = null;
                    } else {
                        tableCell[letra] = automatoWireframe[i][letra];
                    }
                }

                // Verifica se é estado final
                tableCell['endState'] = automatoWireframe[i]['endState'] ? true : false;
                
                maquete.push(tableCell);
            }

            automatoProprieties.automato = maquete;
            setAutomato();
        }

        palavraElement.val('');
        $("#searchWordInput").css("box-shadow", "none");
        $("#searchWordInput").val('')
    });

    // Validação em tempo real das palavras digitadas no campo de busca
    $("#searchWordInput").on("keydown keyup input", function(event) {
        let palavraDigitada = $(this).val();
        if (palavraDigitada === "") {
            $("#foundWords").empty();
            $("#searchWordInput").css("box-shadow", "none");

            //Limpa CSS linhas
            $("#automato tr").removeClass('table-success');
            $("#automato tr").removeClass('table-danger');
            $("#automato tr").removeClass('actual-state');

            return;
        }
        
        // Filtra as palavras que iniciam com a palavra digitada
        let filteredWords = automatoProprieties.palavras.filter(palavra => palavra.startsWith(palavraDigitada));

        automatoValidation(palavraDigitada, event.which);

        // Mostra o campo em vermelho caso não encontre nenhuma palavra valida, se não deixa verde e mostra as encontradas
        let color = colors[4];
        filteredWords.forEach(palavraDigitada => {
            $("#foundWords").append(`<span class="badge rounded-pill text-bg-${color}">${palavraDigitada}</span>`);
        });
     });

     $('#searchWord').click(function(event) {
        event.preventDefault();

        let palavraDigitada = $("#searchWordInput").val();
        let spaceSimulation = 32;

        // Filtra as palavras que iniciam com a palavra digitada
        let filteredWords = automatoProprieties.palavras.filter(palavra => palavra.startsWith(palavra));

        automatoValidation(palavraDigitada, spaceSimulation);

        if (palavraDigitada === "") {
            // Mostra o campo em vermelho caso não encontre nenhuma palavra valida, se não deixa verde e mostra as encontradas
            let color = colors[4];
            filteredWords.forEach(palavraDigitada => {
                $("#foundWords").append(`<span class="badge rounded-pill text-bg-${color}">${palavraDigitada}</span>`);
            });
        }
     })
});

/*
    Função que destrincha a palavra inserida para o automato
*/
function addWordToAutomato(palavraNova) {
    palavraNova = palavraNova.trim();
    
    // Não permite nenhum caractere que não seja letras ou se a palavra estiver vazia
    if (palavraNova.length > 0 && /^[a-z\s]*$/.test(palavraNova)) {
        listSavedWord(palavraNova);

        // Adiciona a palavra nova em um array junto com as outras
        automatoProprieties.palavras.push(palavraNova);

        // Gera os estados do automato baseando-se nas palavras já adicionadas
        for(let i = 0; i < automatoProprieties.palavras.length; i++){
            let palavra = automatoProprieties.palavras[i];
            let q = 0;
    
            for(let j = 0; j < palavra.length; j++){
                let letra = palavra[j];
    
                // Valida se é Estado Inicial
                automatoWireframe[q]['initialState'] = j === 0;
                
                if(!(q in automatoWireframe) || !(letra in automatoWireframe[q])){
                    let nextState = automatoProprieties.qTotal + 1;
                    automatoWireframe[q][letra] = nextState;
                    automatoWireframe[nextState] = [];
                    
                    q = nextState;
                    automatoProprieties.qTotal = nextState;
    
                } else {
                    // Caso a letra já esteja mapeada na linha do evento, a próxima linha a ser trabalhada será a linha do estado que é chamado pela letra existente
                    q = automatoWireframe[q][letra];
                }
    
                // Valida se é Estado Final
                automatoWireframe[q]["endState"] = j === palavra.length - 1;
            }
        }
    }
}

/*
    Cria uma pequena listinha das palavras adicionadas ao automato
*/
function listSavedWord(palavraNova) {
    let colorIndex = Math.floor(Math.random() * colors.length);
    let color = colors[colorIndex]
    $("#savedWords").append(`<span class="badge rounded-pill text-bg-${color}">${palavraNova}</span>`);
}

/*
    Constrói o automato a partir da lista de palavras e da maquete
*/
function setAutomato(){
    $('#automato').empty();
    // Seleciona o contêiner onde a tabela será inserida
    const automato = $('#automato');
    const automatoTable = $('<table>').addClass('table table-striped-columns');

    // Cria o cabeçalho da tabela
    const tr = $('<tr>');
    tr.append($('<th>').text('#'));

    automatoTable.append($('<thead>').append(tr));

    // População das colunas com a letra respectiva no header
    alfabeto.forEach(letra => {
        // Adiciona um cabeçalho para cada letra do alfabeto
        tr.append($('<th>').text(letra));
    });
    automatoTable.append($('<thead>').append(tr));

    // Preenche a tabela com os dados
    const tbody = $('<tbody>');
    for(let j = 0; j < automatoProprieties.automato.length; j++){
        const tr = $('<tr>');
        const td = $('<td>');

        // Apenas coloca -> para estado inicial e * para estado final
        if(automatoWireframe[j]['initialState']){
            td.html('->' + 'q' + automatoProprieties.automato[j]['qX']);
            td.addClass('end');
            tr.addClass('end');
        } else
        if (automatoWireframe[j]['endState']) {
            td.html('*' + 'q' + automatoProprieties.automato[j]['qX']);
            td.addClass('end');
            tr.addClass('end');
        } else
        if (automatoWireframe[j]['initialState'] && automatoWireframe[j]['endState']) {
            td.html('->' + '*' + 'q' + automatoProprieties.automato[j]['qX']);
            td.addClass('end');
            tr.addClass('end');
        } else
        {
            td.html('q' + automatoProprieties.automato[j]['qX']);
        }

        tr.append(td);
        tr.addClass(`state${j}`);

        // Letras em cada quadrado
        for (var k = a; k <= z; k++) {
            let letterPlace = $('<td>');
            let letra = String.fromCharCode(k);

            if (automatoProprieties.automato[j][letra] === null) {
                letterPlace.html('-');
            } else {
                letterPlace.html('q' + automatoProprieties.automato[j][letra]);
            }

            tr.append(letterPlace);
        }
        automatoTable.append(tbody);

        automatoTable.append(tr);
    }

    // Adiciona a tabela ao contêiner
    automato.append(automatoTable);
}

/*
    Aqui fica toda a validação dinâmica do automato
*/
function automatoValidation(palavra, last){
    // Valida se existe uma palavra, ou se foi digitado um espaço ou algo foi apagado
    if(palavra || last == 32 || last == 8){
        // Apenas valida se existirem palavras no automato
        if(automatoProprieties.palavras.length > 0){
            let actualState = 0;
            let error = false;

            $("#automato tr").removeClass('actual-state');
            $("#automato tr").removeClass('table-success');
            $("#automato tr").removeClass('table-danger');
            
            for(let i = 0; i < palavra.length; i++){
                let letra = palavra[i];
                
                if(!error){
                    // Caso não tenha erro e a letra está dentro do alfabeto, valida se 
                    if(letra.charCodeAt(0) >= a && letra.charCodeAt(0) <= z){
                        if(automatoProprieties.automato[actualState][letra] !== null){
                            $("#foundWords").empty();
                            $("#searchWordInput").css("box-shadow", "5px 5px 20px 10px green")
                            $("#foundWords").append(`<h5 class="text-light">Palavras Possíveis</h5>`);
                            $("#automato tr").removeClass('actual-state');
                            $(`.state${actualState}`).addClass('table-success');
                            $(`.state${actualState}`).addClass('actual-state');

                            actualState = automatoProprieties.automato[actualState][letra];
                        } else {
                            $("#foundWords").empty();
                            $("#searchWordInput").css("box-shadow", "5px 5px 20px 10px red")
                            $(`.state${actualState}`).addClass('table-danger')
                            
                            error = true;
                        }
                    }

                    if(last == 32 && i == (palavra.length) - 1){
                        if(automatoProprieties.automato[actualState]['endState']){
                            $("#automato tr").removeClass('actual-state');
                            $(`.state${actualState}`).addClass('table-success');
                            $(`.state${actualState}`).addClass('actual-state');

                            $("#foundWords").empty();
                            $("#searchWordInput").css("box-shadow", "5px 5px 20px 10px green")
                        } else {
                            $("#foundWords").empty();
                            $("#searchWordInput").css("box-shadow", "5px 5px 20px 10px red")
                            $(`.state${actualState}`).addClass('table-danger');

                            error = true;
                        }
                    }
                }
            }
        } else {
            $("#automato tr").removeClass('table-success');
            $("#automato tr").removeClass('table-danger');
            $("#automato tr").removeClass('actual-state');
        }
    }
}
