function initApp() {
    document.getElementById('senhaLogin').addEventListener('keypress', function (e) {if(e.keyCode == 13) {entrar()}})

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        db.doc(`admin/${firebase.auth().currentUser.email}`).get().then(function(doc){
            try {
                doc.data().categoria
                window.location.href = 'page2.html'
            } catch {
                $('#badgeLogin').removeClass('displayNone').html('Conta não administrativa')
                firebase.auth().signOut()
            }
        })
      } else {}
    })
}

function entrar() {
    let emailLogin = document.getElementById('emailLogin').value
    let senhaLogin = document.getElementById('senhaLogin').value
    toggleModal()
    firebase.auth().setPersistence(document.getElementById('check-box-login').checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION)
    .then(function() {
        firebase.auth().signInWithEmailAndPassword(emailLogin, senhaLogin)
        .catch(
            function(error) {
                let message
                if (error.code == 'auth/wrong-password') {
                    message = 'Senha inválida.'
                } else if (error.code == 'auth/user-not-found') {
                    message = 'Usuário inexistente.'
                } else if (error.code == 'auth/invalid-email') {
                    message = 'E-mail inválido.'
                } else if (error.code == ' auth/too-many-requests.') {
                    message = 'Tente novamente mais tarde.'
                } else { 
                    message = `Erro: ${error.code}.`
                }

                $('#badgeLogin').removeClass('displayNone').html(message)
                toggleModal()
            })
    })
}

const signOut = () => { //true então não troca de tela
  firebase.auth().signOut().then(function() {
    window.location.href = 'index.html'
  })
}

function toggleModal() {
    const disabled = $('[btnLogin]').attr('disabled')
    disabled == undefined ? true : false
    $('[btnLogin]').attr('disabled', !disabled);
    $('[loadLogin]').toggleClass('displayNone')
}

/* registro */

function mtel(item){
    let v = item.value
    v=v.replace(/\D/g,"");             //Remove tudo o que não é dígito
    v=v.replace(/^(\d{2})(\d)/g,"($1) $2"); //Coloca parênteses em volta dos dois primeiros dígitos
    v=v.replace(/(\d)(\d{4})$/,"$1-$2");    //Coloca hífen entre o quarto e o quinto dígitos
    item.value = v
}

function initRegistro() {
    new statesCitiesBR({
        states: {
            elementID: "regEstados"
        }
    });

    $('#form3').hide()
    $('#form2').hide()
    $('#regCidades').hide()

    document.querySelector('.regForm').addEventListener('submit', function (e) {
        //senha
        const senhaVal = $('#regSenha').val()
        const regex = /.*[@!#$%^&*()/\\]/
        if(senhaVal != $('#regSenhaValid').val()) {
            $('#regSenha').addClass('is-invalid')
            $('[senhaFeedback]').addClass('invalid-feedback').removeClass('displayNone').html('Senhas não coincidem')
            e.preventDefault()
        } else if (!regex.test(senhaVal)) {
            $('#regSenha').addClass('is-invalid')
            $('[senhaFeedback]').addClass('invalid-feedback').removeClass('displayNone').html('Utilize caracteres especiais')
            e.preventDefault()
        } else if (senhaVal.match(/\d+/g) == null) {
            $('#regSenha').addClass('is-invalid')
            $('[senhaFeedback]').addClass('invalid-feedback').removeClass('displayNone').html('Utilize números')
            e.preventDefault()
        } else {}
    })
}

function initPage2() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            add_liClientes()

            $('#showObs').on('click', function() { //observação plus button
                $('#obs').toggle()
                $('.bi-dash-circle').toggle()
                $('.bi-plus-circle').toggle()
                $('#showObs').popover('show')
                $('#showObs').popover('disable')
            })

            $('#reload-exerc').on('click', async () => {
                await editAddExerc()
                check_adicionouTabela()
            })

            $('#reload-cardapios').on('click', () => {
                adicionaCardapios($('#choose-sel-cardapios').val())
            })  

            $('#emailCliente').on("change", async function() {
                document.getElementById('emailCliente2').value = $('#emailCliente').val()
                criarArraysCardapios($('#emailCliente').val())
                $('#editTable0, #editTable1').removeClass('displayNone')
                await editAddExerc()
            });

            $('#btnAddExerc').on('click', () => {
                insertExerc()
                insertObs()
            })

            $('#btnAddCard').on('click', () => {
                insertDietas()
            })

            $('[goto_pages]').on('click', (e) => {
                $('a[self_active]').removeAttr('self_active')
                $(e.target).attr('self_active', true)
            })

            $('#btnGera-senha').on('click', () => {
                document.getElementById('senha-cadastro').value = gerarSenha()
            })
            $('#btnCadastro').on('click', () => {
                cadastrar()
            })
            
            addPadding('#editCardapio', 'top')
            addPadding('#editCardapio', 'bottom')
            addPadding('#editExerc', 'bottom')
            addPadding('#editExerc', 'top')
            addPadding('#regPage', 'bottom')

            new Promise(() => {
                db.doc('admin/' + firebase.auth().currentUser.email).get().then(async docs => {
                    if (docs.data().categoria === 0) {
                        await apaga_goto(0)
                    } else {
                        await apaga_goto(1)
                    }
                    return
                })
            }).then($('#page').fadeIn(800))
        } else {
            window.location.href = 'index.html'
        }
    })
}

function apaga_goto(v) {
    if (v === 0) {
        $('#editCardapio').hide();$('#goto_card').hide()
    } else {
        $('#editExerc').hide();$('#goto_exerc').hide()
    }

    return
}

function addPadding(id, side) { //true poe o dobro do vh

    waitUntil(
      function () {
        console.log('padding-'+side, 'calc(50vh - '+$(id).height() / 2 + 'px )')
        $(id).css('padding-'+side, 'calc(50vh - '+$(id).height() / 2 + 'px )')
      },
      function() {
        // the code that tests here... (return true if test passes; false otherwise)
        return !!($(id).height() > 0)
      },
      50
    )();
}

const waitUntil = function (fn, condition, interval) {
    interval = interval || 100;

    const shell = function () {
            let timer = setInterval(
                function () {
                    let check;

                    try { check = !!(condition()); } catch (e) { check = false; }

                    if (check) {
                        clearInterval(timer);
                        delete timer;
                        fn();
                    }
                },
                interval
            );
        };

    return shell;
};

function add_liClientes() {
    db.doc('admin/'+firebase.auth().currentUser.email).get().then( (docs) => {
        for (let i = 0; i < docs.data().emailAlunos.length; i++) {
            $('.list_users').append(`<li class="list-group-item pl-1">${docs.data().emailAlunos[i]}</li>`)
        }    
    })
}

function getCidades(estado) {
    $('#regCidades').show(400)
    let sigla = $(`option[value='${estado}'`).attr('data-uf')
    new statesCitiesBR({
    cities: {
        elementID: "regCidades",
        state: sigla,
        defaultOption: "Selecione uma cidade"
    }});

}

const lanche = ['desjejum', 'lanche1', 'almoco', 'lanche2', 'jantar', 'ceia']
const mensagemColecaoVazia = "<div style='text-align: justify; margin: 15px'><strong>Vazio</strong>: não há coleções para este usuário. <br> <strong> Adicione</strong>: Insira o nome do treino, por exemplo 'perna', em seguida o exercício, o SxR, e as técnicas avançadas <u>entre vírgulas</u>. Na última linha insira o número deste exercício, por exemplo, '1', ele será o primeiro elemento na tabela, '2', o segundo, e se por acaso você inserir o '4' sem o '3', o '4' será o terceiro. Se você quiser reescrever um exercício específico em uma coleção (treino), basta inserir o nome dele (com diferenciação entre maiúsculo e minúsculo) e inserir o número deste exercício.</strong><br><strong>Excluir</strong>: para excluir basta habilitar a exclusão, e arrastar o exercício a ser excluído. Para excluir uma coleção inteira (treino), insira o nome (com diferenciação entre maiúsculo e minúsculo) no campo que aparecerá embaixo. Para excluir uma observação, ou você exclui toda a coleção, ou reescreva a observação, inserindo o nome do treino, para os dados atualizarem.</div>"
let arrayTreinos = new Array()

//perfil

function initPerfil() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $('#perfil').fadeIn(800)
            changeName()
            add_liClientes()
            add_Contatos()
            $("#nomeUsuario").on('mouseover', function() {
                $('#editNome').show()
            })
            $("#nomeUsuario").on('mouseleave', function() {
                $('#editNome').hide()
            })
        } else {
            window.location.href = 'index.html'
        }
    })
}

function add_Contatos() {
    const user = firebase.auth().currentUser
    db.doc('admin/'+ user.email).get().then(docs => {
        const wpp = docs.data().contatos[0]
        $('#wpp').val(wpp)
        $('#insta').val(docs.data().contatos[1])
        $('#face').val(docs.data().contatos[2])
        $('#contatos_novoEmail').val(docs.data().contatos[3])
    })
}

function changeName() {
    const user = firebase.auth().currentUser
    $('#nomeUsuario').val(user.displayName === null ? 'Seu nome' : user.displayName)
    db.doc('admin/'+ user.email).get().then(docs => {
        docs.data().categoria == 0 ? $('#categoria').html('Personal Trainer') : $('#categoria').html('Nutricionista')
    })
}

// db adicionando

function criarArraysCardapios(userEmail = firebase.auth().currentUser.email) {
  let i2 = 0
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    desjejum.length = 0;lanche1.length = 0;almoco.length = 0;lanche2.length = 0;jantar.length = 0;ceia.length = 0 //limpando os arrays para quando entrar em outra conta não ficar as mesmas dietas
      for (let i = 0; i < lanche.length; i++) {
        db.collection(`alunos/${userEmail}/cardapios/${lanche[i]}/linha`).get().then(function(doc){
          for (let i2 = 0; i2 < doc.docs.length; i2++ ) {
            getArrayCardapio(lanche[i], doc.docs[i2].data(), i2)
          }
        })
      }
      //adicionaCardapios()
    }
  })
}

/* Inserindo dados no backend */
async function insertDietas() {
  const emailInputed = $('#emailCliente').val()
  const nomeDoAlimento = $('#nome-do-alimento').val()
  const medidas = $('#medidas-e-qtndds').val()
  const lanche = $('#choose-sel-cardapios').val()
  const linha = $('#idTabelaDietas').val() //diz-se a qual linha se encontrará a informação

  await db.collection(`alunos/${emailInputed}/cardapios/${lanche}/linha`).doc(linha).set({
    nomeDoAlimento,
    medidas,
    linha
  }).then(console.log('Alterações encaminhadas')).catch((err) => {console.log(err)})
}

function insertObs() {
  const intervaloInputed = document.getElementById('instExerc').value
  const emailInputed = document.getElementById('emailCliente').value
  const treinoInputed = document.getElementById('treinoInput').value

  const obs1 = document.getElementById('obs-pre').value
  const obs2 = document.getElementById('obs-aero').value
  const obs3 = document.getElementById('obs-pos').value
  const obs4 = document.getElementById('obs-geral').value

  db.collection(`alunos/${emailInputed}/treinos/${treinoInputed}/obs`).doc('obs').set({
    obs1,
    obs2,
    obs3,
    obs4,
    intervalo: intervaloInputed
  }).then(console.log('Alterações encaminhadas'))
}

//fim

function insertExerc() {
  let email = document.getElementById('emailCliente').value
  let treino = document.getElementById('treinoInput').value

  let exercicio1 = document.getElementById('exercName').value
  let exercicio2 = document.getElementById('sxr').value
  let exercicio3 = document.getElementById('tecAvan').value
  let inst = document.getElementById('instExerc').value

  try {
    db.collection(`alunos/${email}/treinos/${treino}/linha`).doc(linha).set({
    newExerc1: exercicio1,
    newExerc2: exercicio2,
    newExerc3: exercicio3,
    linha: linha
  }).then(console.log('Alterações encaminhadas'))
  try {db.doc(`alunos/${email}`).update({treinos: firebase.firestore.FieldValue.arrayUnion(treino)})} catch {db.doc(`alunos/${email}`).set({treinos: firebase.firestore.FieldValue.arrayUnion(treinoInpt)})}
  } catch {console.log('Inconsistência')}
}


/* Inserindo Dietas na página */
const desjejum = new Array()
const lanche1 = new Array()
const almoco = new Array()
const lanche2 = new Array()
const jantar = new Array()
const ceia = new Array()

function getArrayCardapio(stringCardapio, value = undefined, i2 = undefined) {
  for (let i in lanche) {
    if (stringCardapio == lanche[i]) {
        if (i == 0) { if(value) {desjejum[i2] = value} else { return desjejum }}
        if (i == 1) { if(value) {lanche1[i2] = value} else { return lanche1 }}
        if (i == 2) { if(value) {almoco[i2] = value} else { return almoco }}
        if (i == 3) { if(value) {lanche2[i2] = value} else { return lanche2 }}
        if (i == 4) { if(value) {jantar[i2] = value} else { return jantar }}
        if (i == 5) { if(value) {ceia[i2] = value} else { return ceia }}
    }
  }
}

async function adicionaCardapios(stringCardapio) {

  let cardapio = await getArrayCardapio(stringCardapio)

  if (cardapio == ''){$('#editTable1').html(mensagemColecaoVazia)} else {
    const end = "</tbody> </table><br> <br></ons-gesture-detector>"//pula duas linhas para o botão não ficar na frente
    let table = "<ons-gesture-detector><table editTable class='table shadow'> <thead> <tr> <th scope='col'>Nº</th> <th scope='col'>Nome</th> <th scope='col'>Medidas</th> </tr> </thead> <tbody id='cardapioEdit'>"
    
    for (let i = 0; i < cardapio.length; i++) {
      table = table +      
       `<tr id="${cardapio[i].linha}" draggable>
            <th scope="row">${cardapio[i].linha}</th>
            <td>${cardapio[i].nomeDoAlimento}</td>
            <td>${cardapio[i].medidas}</td>
        </tr>`
    }

    table = table+end
    document.getElementById('editTable1').innerHTML = table
  }                 
}

//EXERCICIOS 

function addObs(observ1, observ2, observ3, observ4, boolean) {   
  let ulObs1 = document.getElementById('obs-pre')
  let ulObs2 = document.getElementById('obs-aero')
  let ulObs3 = document.getElementById('obs-pos')
  let ulObs4 = document.getElementById('obs-geral')

  if (boolean) {
    ulObs1.removeChild(document.getElementById('liObs10'))
    ulObs2.removeChild(document.getElementById('liObs20'))
    ulObs3.removeChild(document.getElementById('liObs30'))
    ulObs4.removeChild(document.getElementById('liObs40'))
  }

  let liObs1 = document.createElement('h5')
  let liObs2 = document.createElement('h5')
  let liObs3 = document.createElement('h5')
  let liObs4 = document.createElement('h5')


  liObs1.setAttribute('style', 'margin: 0px 2px; font-weight: bolder')
  liObs2.setAttribute('style', 'margin: 0px 2px; font-weight: bolder')
  liObs3.setAttribute('style', 'margin: 0px 2px; font-weight: bolder')
  liObs4.setAttribute('style', 'margin: 0px 2px; font-weight: bolder')

  liObs1.setAttribute('id', 'liObs10')
  liObs2.setAttribute('id', 'liObs20')
  liObs3.setAttribute('id', 'liObs30')
  liObs4.setAttribute('id', 'liObs40')

  liObs1.appendChild(document.createTextNode(observ1))
  liObs2.appendChild(document.createTextNode(observ2))
  liObs3.appendChild(document.createTextNode(observ3))
  liObs4.appendChild(document.createTextNode(observ4))
      
  ulObs1.appendChild(liObs1)
  ulObs2.appendChild(liObs2)
  ulObs3.appendChild(liObs3)
  ulObs4.appendChild(liObs4)
}

function addExercicio(exercicio, Sxr, tecAvan, tabela, email, indice, linhas) {
    let tableData = document.getElementById(`${tabela}`);
    let openGesture = '<ons-gesture-detector>';let closeGesture = '</ons-gesture-detector>'

    let table = `
    <table class="table shadow" style="background-color: #fff">
        <thead>
          <tr>
            <th scope="col" style="vertical-align: middle; text-align: left">Nº</th>
            <th scope="col" style="vertical-align: middle; text-align: left">Exercícios</th>
            <th scope="col" style="vertical-align: middle; text-align: left">SxR</th>
            <th scope="col" style="vertical-align: middle; text-align: left">Técnicas Avançadas</th>
          </tr>
        </thead>
    <tbody class="text-left">
    `;

    for (let i = 0; i <= exercicio.length-1; i++) {
    table = table +
    `<tr id="${linhas[i]}" draggable>
      <th scope="row">${linhas[i]}</th>
        <td>${exercicio[i]}</td>
        <td>${Sxr[i]}</td>
        <td>${tecAvan[i]}</td>
    </tr>`
    }

    let obs1; let obs2; let obs3; let obs4; let int; const treino = $('#sub-choose-sel-treinos').val()
    db.collection(`alunos/${email}/treinos/${treino}/obs`).doc('obs').get().then((doc) => {
      try {int = doc.data().intervalo} catch {int = 'N/A'}
      // se não houver observação para tal treino, então terá um valor padrão
      for (let i = 0; i <= exercicio.length-1; i++) {
        try {obs1 = doc.data().obs1; obs2 = doc.data().obs2; obs3 = doc.data().obs3; obs4 = doc.data().obs4}
        catch {obs1 = 'N/A'; obs2 = 'N/A'; obs3 = 'N/A'; obs4 = 'N/A'}
      }
      table = table +
          `<tr>
            <tr>
              <th scope="row">Obs. pré</th>
              <td class="text-left" colspan="3">${obs1}</td>
            </tr>
            <tr>
              <th scope="row">Obs. pós</th>
              <td class="text-left" colspan="3">${obs2}</td>
            </tr>
            <tr>
              <th scope="row">Obs. aeróbico</th>
              <td class="text-left" colspan="3">${obs3}</td>
            </tr>
            <tr>
              <th scope="row">Obs. geral</th>
              <td class="text-left" colspan="3">${obs4}</td>
            </tr>
            <tr>
              <th scope="row">Int. </th>
              <td class="text-left" colspan="3">${int}</td>
            </tr>
          </tr>
        </tbody>
      </table>`
      tableData.innerHTML = table
    })
}

const addThings = async (email, i, tabela, boolean) => {
  zerar()
  firstTimer()
  let exercicio1 = new Array()
  let exercicio2 = new Array()
  let exercicio3 = new Array()
  let linhas = new Array()
  await db.collection(`alunos/${email}/treinos/${arrayTreinos[i]}/linha`).get().then(e => e.forEach(doc => {
    exercicio1.push(doc.data().newExerc1)
    exercicio2.push(doc.data().newExerc2)
    exercicio3.push(doc.data().newExerc3)
    linhas.push(doc.data().linha)

   addExercicio(exercicio1, exercicio2, exercicio3, tabela, email, i, linhas)
  }));

  await db.doc(`alunos/${email}/treinos/${arrayTreinos[i]}/obs/obs`).get().then((docs) => {
    if (docs.exists) {
        if (boolean) {
          addObs(docs.data().obs1, docs.data().obs2, docs.data().obs3, docs.data().obs4, true)
        } else {
          addObs(docs.data().obs1, docs.data().obs2, docs.data().obs3, docs.data().obs4)
      }
    } else {
        if (boolean) {
          addObs('N/d', 'N/d', 'N/d', 'N/d', true)
        } else {
          addObs('N/d', 'N/d', 'N/d', 'N/d')
        }
    }
  })
  return
}

function editAddExerc() {
  userEmail = $('#emailCliente').val()
  db.doc(`alunos/${userEmail}`).get().then(async function (e) {
    if (e.exists) {
      if (e.data().treinos.length === 0 ){$('#editTable0').html(mensagemColecaoVazia);}
      else {
        showHideChooseSels(true)
        document.getElementById('editTable0').innerHTML = ''
        document.getElementById('editTable1').innerHTML = ''
        arrayTreinos = await db.doc(`alunos/${userEmail}`).get().then(function(e) {return e.data().treinos}) //primeiro att arrayTreinos, depois chama as funcoes que irao usar ele
        await addThings(userEmail, 0, 'editTable0', false)
        addChooseSel(userEmail, 'choose-sel-treinos')
        return
      }
    } else { throw new Error('E-mail inválido <strong> ou recente</strong>, não constando com dados.<br><strong> Caso o email esteja correto, adicione os campos</strong>.')}
  }).catch((q) => {
    document.getElementById('editTable0').innerHTML = q
    document.getElementById('editTable1').innerHTML = q
    document.getElementById('choose-sel-treinos').style.display = 'none'
    document.getElementById('choose-sel-cardapios').style.display = 'none'
  })
}

document.addEventListener('init', async function(event) {
    document.addEventListener('dragend', function(event) {
      if (event.gesture.distance > getSizeOf('#tabelaExercicios', 'width') / 2 && event.gesture.direction == 'left') {
        increaseIndice()
        let userEmail = firebase.auth().currentUser.email;
        indice = indice++
        if (indice >= arrayTreinos.length) {
          indice = indice - 1 //se o indice passar do valor total ele para de avancar
        }
        addThings(userEmail, indice, "tabelaExercicios", true)
      } else if  (event.gesture.distance > getSizeOf('#tabelaExercicios', 'width') / 2 && event.gesture.direction == 'right') {
        decreaseIndice()
        const userEmail = firebase.auth().currentUser.email;
        indice = indice - 1 
        if (indice < 0) {indice = 0}//se o indice ficar menor do que 0 ele para de descer
        addThings(userEmail, indice, "tabelaExercicios", true)
      } else { document.querySelector("#tabelaExercicios").style.left = 0 + 'px'}
    })
})
function decreaseIndice() { //diz respeito ao valor atual do treino, ex: A,B,C
  return indice = indice - 1
}

function increaseIndice() {
  return indice = indice+1
}


let indice = 0;

function editSelects(event, email = firebase.auth().currentUser.email) {
  const treino = event.target.value // array treinos -> A,B,C
  let indiceDoTreino
  for (let i = 0; i <= arrayTreinos.length; i++) {
    if (arrayTreinos[i] == treino) {
      indiceDoTreino = i //indice é o número correspondente à posição da letra no array de treinos
      indice = i // indice com valor global para o drag right e left
    }
  }
  let id

  id = "editTable0"
  addThings(email, indiceDoTreino, id, true)
}

const addChooseSel = (email, id) => {
  let arg = `event, '${$('#emailCliente').val()}',${true}`
  const inicioTag = `<select id='sub-${id}' class="custom-select w-sm" onchange="editSelects(${arg.substring(0,arg.length)})">`
  let valores = ``
  const fimTag = `</select>`

  for (let i = 0; i < arrayTreinos.length; i++) {
    valores += `<option select-id='${i}' value='${arrayTreinos[i]}'>Treino ${arrayTreinos[i]}</option>`
  }

  const html = inicioTag+valores+fimTag
  const chooseTreinos = document.getElementById(id)
  chooseTreinos.innerHTML = html
}

let id = 0;
let firstTime = true
function zerar() {return id = 0;}
function secondTime() {return firstTime = false}
function firstTimer() {return firstTime = true}

function showHideChooseSels(boolean = false) { //se booleano, então a função foi chamada pelo addEditExerc. Não precisa trocar a classe para displayNone ou inline-block vice-versa.
  $('.bi-arrow-repeat').removeClass('displayNone')
  if (opcaoEdit() == 1) { //se exercícios
    boolean ? $('#choose-sel-treinos').removeClass('displayNone') : $('#choose-sel-treinos').toggleClass('displayNone inline-block')
  } else {
    $('#choose-sel-cardapios').toggleClass('displayNone inline-block')
  }
}

function excluirDados(indice = false) { //SIGNIFICA A LINHA QUE EXCLUIRÁ
  let cardapioNome = $('#choose-sel-cardapios').val()
  let treinoNome = $('#sub-choose-sel-treinos').val()
  let emailCliente = $('#emailCliente').val()
  const colecaoTreino = $('#excluirTreino').val()
  const colecaoDieta = $('#excluirDieta').val()
  let excluirColecao;let treinoOuDieta;let documento
  
  if (opcaoEdit() == 1) {documento = treinoNome;treinoOuDieta = 'treinos'; excluirColecao = colecaoTreino} else {documento = cardapioNome;treinoOuDieta = 'cardapios'; excluirColecao = colecaoDieta}
  if (!indice) {deleteColecao()} else {deleteDoc()}

  function deleteColecao() {//Apagando colecao item por item, mas deixando-a existente. Plano pago pode-se alterar para remoção de coleção por completo
    ons.notification.confirm('Excluir TODA a coleção '+excluirColecao+'?').then(function(r){ if (r) {
      delete_chooseSel()
      let i = 0     
      db.collection(`alunos/${emailCliente}/${treinoOuDieta}/${excluirColecao}/linha`).get().then(e => {
        if (e.empty) {
          showToast("Documento inexistente")
        } else {
          showToast('Excluindo...')
          e.forEach(doc => {
            if (doc.exists) {
              db.collection(`alunos/${emailCliente}/${treinoOuDieta}/${documento}/linha`).doc(`${doc.data().linha}`).delete()
            } else {
              showToast("Documento inexistente")
            }     
          })
        }
      }).then(function() {
        if (opcaoEdit() == 1) {
          showToast('Coleção deletada com sucesso!')
          $('#editTable0').empty()
          delete_arrayTreinos($('#emailCliente').val(), documento)
          deleteObs(emailCliente, excluirColecao)
        } else {
          criarArraysCardapios(emailCliente) /*att cardápios*/
          $('#editTable1').empty()
          showToast('Coleção deletada com sucesso!')}
          deleteSwitch_disable() //desliga caso esteja ligado
      }).catch(showToast("Erro na exclusão da coleção:" + excluirColecao))
    }})
  }

  function deleteDoc() {
    db.doc(`alunos/${emailCliente}/${treinoOuDieta}/${documento}/linha/${indice}`).get().then(doc => {
      if (doc.exists) {
        const qtddItens = document.querySelectorAll(`#editTable0 tr[id]`).length
        db.collection(`alunos/${emailCliente}/${treinoOuDieta}/${documento}/linha`).doc(indice).delete().then(function() {
          showToast("Documento deletado com sucesso!");
          if (opcaoEdit() == 1 && qtddItens == 0) {
            delete_arrayTreinos()
            delete_chooseSel()
            deleteObs(emailCliente, excluirColecao)
          } //remove do array
        }).catch(showToast("Erro na exclusão do documento "+indice+"."))
      } else {showToast("Documento inexistente")}
    })
  }

  function delete_chooseSel() {if (treinoOuDieta == 'treinos') {$(`#sub-choose-sel-treinos option[value='${colecaoTreino}']`).remove()} else {$(`#choose-sel-cardapios option[value='${colecaoDieta}']`).remove()}}
  function delete_arrayTreinos() {db.doc('alunos/'+emailCliente).update({treinos: firebase.firestore.FieldValue.arrayRemove(documento)})}
}



function deleteObs(email, excluirColecao) {showToast('Excluindo observações...');db.doc(`alunos/${email}/treinos/${excluirColecao}/obs/obs`).delete()}

//GRUPO DE FUNÇÕES SWITCH EXCLUIR PÁGINA EDIT
let $askAgainEditDelete = true
function askAgainEditDelete(elem) {elem.checked ? $askAgainEditDelete = true : $askAgainEditDelete = false}
function deleteSwitch_check() {document.getElementById('deleteSwitch').checked ? enable_excluirDados() : disable_excluirDados()}
function deleteSwitch_disable() {document.getElementById('deleteSwitch').checked ? deleteSwitch_click() : {}}
function deleteSwitch_click() {document.getElementById('deleteSwitch').click()}

function enable_excluirDados() {
  $('#excluirDados').removeClass('displayNone')
  dragItems('tr[draggable]', dragEnd_tablesEdit, true)
}

function disable_excluirDados() {
  $('#excluirDados').addClass('displayNone')
  const elementosDaTabela = document.querySelectorAll('tr[draggable]')
  for (let x = 0; x < elementosDaTabela.length; x++) {
    elementosDaTabela[x].ondragstart = function(e) {}
  }
}

function dragEnd_tablesEdit(e) {
  let $target; if(e.target.nodeName == 'TR') {$target = e.target} else {$target = e.target.parentNode} //TR
  async function reloadTable() {
    excluirDados($target.getAttribute('id'));
    $($target).remove();
    $target.ondragstart = function(e) {};
    $target.ondrag = function(e) {};
    if (opcaoEdit() == 1) {
        await editAddExerc()
        deleteSwitch_click()
    } else {
        criarArraysCardapios($('#emailCliente').val())
    }}

  $target.style.position = 'relative'
  $('#delete-tr').remove() //apaga uma div que foi adicionada como background enquanto o target era absoluto
  let tableWidth = opcaoEdit() == 2 ? $('#cardapioEdit').children().children().get()[0].offsetWidth : $('tr[style]').children().get()[0].offsetWidth //th width
  if (e.gesture.distance >= tableWidth) {
    $target.style.left = 0
    if ($askAgainEditDelete) {ons.notification.confirm('Prosseguir na exclusão do elemento '+$target.getAttribute('id')+'?').then(function(r){ if (r) {reloadTable() }})}
    else {reloadTable()}
    
  } else {$target.style.left = 0}
}

//TERMINA AQUI

function opcaoEdit() {return $('#editExerc').hasClass('displayNone') ? 2 : 1}
function showHideDeleteData(value) {$('#excluirTreino').toggleClass('displayNone');$('#excluirDieta').toggleClass('displayNone')}

function check_deleteSegment() {if (document.getElementById('deleteSwitch').checked == true)document.getElementById('deleteSwitch').click()}

const caracteres = ['A','B','C','D','E','F','G','H','I','J','K','L','@','W','$','&','#','!','W','V','X','Z','O']
function gerarSenha(){
  let passw = Math.floor(1000* Math.random() + 1);
  passw = passw + caracteres[Math.floor(caracteres.length * Math.random() + 1)] 
  passw = passw + caracteres[Math.floor(caracteres.length * Math.random() + 1)]
  passw = passw + caracteres[Math.floor(caracteres.length * Math.random() + 1)]
  return passw
}

function cadastrar() {
  primeiraVezRedirecionado = false
  let user = firebase.auth().currentUser;
  let senhaCadastro = document.getElementById('senha-cadastro').value;
  let emailCadastro = document.getElementById('email-cadastro').value;
  let admPassw = document.getElementById('adm-passw').value;

  $('#email-cadastro, #senha-cadastro, #adm-passw').popover('hide')

  if (emailCadastro.length < 4) {
    $('#email-cadastro').popover('show')
    return;
  }
  if (senhaCadastro.length < 4) {
    $('#senha-cadastro').popover('show')
    return;
  }
  firebase.auth().signInWithEmailAndPassword(user.email, admPassw)
  .then(function() {
    firebase.auth().createUserWithEmailAndPassword(emailCadastro, senhaCadastro)
    .then(function(){
      firebase.auth().signInWithEmailAndPassword(user.email, admPassw)
      verificaEmail(emailCadastro)
    })
  })
  .catch(function(error) {
    $('#adm-passw').attr('data-content', trataErros(error.code)).popover('show')
  })
}

function trataErros(errorCode) {
if (errorCode === 'auth/wrong-password') {
      return 'E-mail ou senha inválidos.'
    } else if (errorCode === 'auth/invalid-email') {
      return 'Insira um email válido.'
    } else if (errorCode === 'auth/too-many-requests') {
      return 'Aguarde um momento para tentar novamente!'
    } else if(errorCode === 'auth/user-not-found') {
      return 'Usuário inexistente.'
    } else {
      return errorMessage
    }
}

function verificaEmail(user) {
  user.sendEmailVerification().then(function() {
    return 'Email de verificação enviado!'
  }).catch(function(error) {
    return trataErros(error.code)
  });
}
/* 
function dragItems(itemId, fnctEnd, target = false) { //if target true, itemId must be a major div, like ul instead of li
  const items = document.querySelectorAll(itemId);

  if (target) {for (let i = 0; i < items.length; i++) {dragItem(items[i], fnctEnd, target)}} else {dragItem(items[0], fnctEnd)}
}

function dragItem(item, fnctEnd, target = false) {
    item.ondragstart =  function(e) {
    if(target) {
      let $target; if(e.target.nodeName == 'TR') {$target = e.target} else {$target = e.target.parentNode}

      $target.style.position = 'absolute'
      let $targetHTML = $($target).children()[0]
      if (document.getElementById('delete-tr')) {} else {$($target).after(`<tr id='delete-tr'><th style='color:transparent'>${$($targetHTML).html()}</th><td colspan='3' style='background: red; border-radius: 10px; text-align: center'><ons-icon icon='trash-alt'</ons-icon></td></tr>`)}
      fn.vleft = parseInt(item.style.left || 0,10);
    } else {
      fn.vleft = parseInt(item.style.left || 0,10)
    }
  };

  item.ondrag = function(e) {
    if(target) {
      let $target; if(e.target.nodeName == 'TR') {$target = e.target} else {$target = e.target.parentNode}
      $target.style.left = parseInt(fn.vleft + e.gesture.deltaX) + 'px' 
    } else { item.style.left = parseInt(fn.vleft + e.gesture.deltaX)  +'px'}
  }

  item.addEventListener('dragend', fnctEnd);
}

function dragEnd_Username(e) {
  let bodyWidth = getSizeOf('body', 'width') //bodyWidth - tamanho da div dividido por dois porque há dois lados
  if (e.gesture.distance >= ((bodyWidth - 216 ) / 2) || e.gesture.distance <= - ((bodyWidth - 216 ) / 2)) {
    document.querySelector("#userChangeDataCarousel").style.left = 0 +'px'
    showAddUserName()
  } else {document.querySelector("#userChangeDataCarousel").style.left = 0 +'px'}
}

*/