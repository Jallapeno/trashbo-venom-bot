const venom = require('venom-bot');
const axios = require('axios');
const cron = require('node-cron');

const urlApiTrashBot = 'http://localhost:3000';
const urlApiViaCep = 'https://viacep.com.br/ws/';

async function coleta(cep) {
    const response = await axios.get(urlApiTrashBot + '/coleta/' + cep);
    console.log(response['data']);
    return response['data']
}

async function verificaCep(cep) {
  if(String(cep).length === 8) {
    const response = await axios.get(urlApiViaCep + cep + '/json/');
    return response['data'];
  } else {
    return false;
  }
}

// verificaCep('72241606').then((result) => {
//   console.log(result);
// }).catch((erro) => {
//   console.log(erro);
// })

venom.create({
    session: 'session-name', //name of session
    multidevice: false // for version not multidevice use false.(default: true)
  })
  .then((client) => {
    start(client)
  })
  .catch((erro) => {
    console.log(erro);
  });
  
  function start(client) {
    client.onMessage((message) => {
      if ((message.body === 'Oi' || 
        message.body === 'Olá' || 
        message.body === 'Bom dia' || 
        message.body === 'Boa tarde' || 
        message.body === 'Boa noite') && 
        message.isGroupMsg === false) {
          client
          .sendText(message.from, 'Olá. Tudo bem? Pode falar com o Hytalo normalmente.\n\nSó quero te avisar que esse número é controlado por um bot chamado Trashbo 🤖.\nEle está aqui para te avisar sobre as coletar diárias de lixo.\n\nSempre que quiser posso lhe informar o tipo de coleta do próximo dia para assim você separar seu lixo de forma correta.\n\nPara acionar o Trashbo basta enviar a palavra *Ativar*.\nEm seguida ele pedirá seu Cep\nA partir daí todos os dias uma vez por dia você receberá uma mensagem informando a hora e o tipo de coleta do dia seguinte.\n\nVamos cuidar do meio ambiente juntos.')
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
      }
  
      if (message.body === 'Ativar' && message.isGroupMsg === false) {
        client
        .sendText(message.from, 'Estou ativando o bot para seu número.\n\nAguarde...')
        .then((result) => {
          // create group abaixo
          client
          .createGroup('TrashBot - Bot de Coleta', [result['to']['remote']['_serialized']])
          .then((result) => {
            client
            .sendText(result['gid']['_serialized'], 'Prontinho. Agora preciso que você envie seu Cep')
            .then((result) => {
              console.log('Criou grupo corretamente', result);
            })
            .catch((erro) => {
              console.log('Erro ao enviar mensagem pedindo Cep: ', erro);
            })
          })
          .catch((erro) => {
            console.log('Erro ao criar grupo: ', erro);
          })

        })
        .catch((erro) => {
            console.error('Erro ao enviar mensagem de ativacao: ', erro); //return object error
        })
      }

      if (message.isGroupMsg === true && 
      message.chat.id === '120363022930612206@g.us' &&
      message.chat.name === 'TrashBot - Bot de Coleta') {
        verificaCep(message.body)
        .then((result) => {
          client
          .sendText(message.from, 'Um momento... 👀')
          .then((result) => {
            coleta(message.body)
            .then((x) => {
              //mensagem de coleta convencional 
              client
              .sendText(message.from, x['convencional']['message'])
              .then((result) => {
                console.log('Result: ', result); //mensagem de coleta convencional enviada para o usuario com sucesso
              })
              .catch((erro) => {
                console.error('Erro ao enviar mensagem de coleta CONVENCIONAL: ', erro); //return object error
              });
              //mensagem de coleta seletiva
              client
              .sendText(message.from, ['seletiva']['message'])
              .then((result) => {
                console.log('Result: ', result); //mensagem de coleta seletiva enviada para o usuario com sucesso
              })
              .catch((erro) => {
                console.error('Erro ao enviar mensagem de coleta SELETIVA: ', erro); //return object error
              });
            })
            .catch((erro) => {
              console.log('Erro ao consultar coletas:', erro);
            })
          }).catch((erro) => {
            console.log('Erro ao enviar mensagem de aguardar: ', erro);
          })
        })
        .catch((erro) => {
          console.log('Cep inválido', erro);
        })
          // cron.schedule("0 18 * * 1-7", () => coleta(cep));
      }
    });
  }