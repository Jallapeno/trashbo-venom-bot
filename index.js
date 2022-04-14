const venom = require('venom-bot');
const axios = require('axios');
const cron = require('node-cron');

const urlApiTrashBot = 'http://localhost:3000';

const hoje = new Date();
const amanha = new Date();
amanha.setDate(hoje.getDate() + 1);

const amanhaSplit = amanha.toLocaleDateString('pt-br', {weekday: "long", month: "long", day: "numeric"}).split("-", 1);
const amanhaSplitStr = String(amanhaSplit[0]);

async function coleta(cep) {
    const response = await axios.get(urlApiTrashBot + '/coleta/' + cep);
    console.log(response['data']);
    return response['data']
}

venom.create({
    session: 'session-name', //name of session
    multidevice: false // for version not multidevice use false.(default: true)
  })
  .then((client) => start(client))
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
          .sendText(message.from, 'Olá. Eu me chamo TrashBot 🤖.\nEstou aqui para te avisar sobre as coletar diárias de lixo.\n\nTodos os dias irei informar qual tipo de coleta do próximo dia para assim você separar seu lixo de forma correta.\n\nVamos cuidar do meio ambiente juntos.')
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
      }
  
      if (message.body === '72241606') {
        client.sendText(message.from, 'Um momento...')
        .then((response) => {
            coleta(message.body).then((x) => {
              const isFrequenciaConvencional = String(x['convencional']['frequencia']).search(amanhaSplitStr.replace(/^\w/, (c) => c.toUpperCase()).split(",",1));
              const isFrequenciaSeletiva = String(x['seletiva']['frequencia']).search(amanhaSplitStr.replace(/^\w/, (c) => c.toUpperCase()).split(",",1));
              
              if(isFrequenciaConvencional != -1) {
                console.log('Amanhã terá coleta CONVENCIONAL. Das ' + x['convencional']['horario_inicio'] + ' às ' + x['convencional']['horario_termino']);
                client
                .sendText(message.from, 'Amanhã terá coleta CONVENCIONAL. Das ' + x['convencional']['horario_inicio'] + ' às ' + x['convencional']['horario_termino'])
                .then((result) => {
                  console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              }

              if(isFrequenciaSeletiva != -1) {
                console.log('Amanhã terá coleta SELETIVA. Das ' + x['seletiva']['horario_inicio'] + ' às ' + x['seletiva']['horario_termino']);
                client
                .sendText(message.from, 'Amanhã terá coleta SELETIVA. Das ' + x['seletiva']['horario_inicio'] + ' às ' + x['seletiva']['horario_termino'])
                .then((result) => {
                  console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
              } 
              
              else {
                console.log('Amanhã não tem coleta');
              }
            })
            // cron.schedule("0 18 * * 1-7", () => coleta(cep));
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
        })

        // buscaEnderecoColetaConvencional('72241606').then((x) => {
        //   coletaConvencional(x['data']['candidates'][0]['location']['x'],x['data']['candidates'][0]['location']['y']).then((res) => {
        //     const data = JSON.parse(res);
        //     const isFrequencia = String(data.frequencia).search(amanhaSplitStr.replace(/^\w/, (c) => c.toUpperCase()).split(",",1));
        //     if(isFrequencia != -1) {
        //       console.log('Amanhã terá coleta CONVENCIONAL. Das ' + data.horario_inicio + ' às ' + data.horario_termino);
        //       client
        //       .sendText(message.from, 'Amanhã terá coleta CONVENCIONAL. Das ' + data.horario_inicio + ' às ' + data.horario_termino)
        //       .then((result) => {
        //         console.log('Result: ', result); //return object success
        //       })
        //       .catch((erro) => {
        //         console.error('Error when sending: ', erro); //return object error
        //       });
        //     } else {
        //       console.log('Amanhã não tem coleta CONVENCIONAL');
        //     }
        //   });
        // });
  
        // buscaEnderecoColetaSeletiva('72241606').then((x) => {
        //   coletaSeletiva(x['data']['candidates'][0]['location']['x'],x['data']['candidates'][0]['location']['y']).then((res) => {
        //     const data = JSON.parse(res);
        //     const isFrequencia = String(data.frequencia).search(amanhaSplitStr.replace(/^\w/, (c) => c.toUpperCase()).split(",",1));
        //     if(isFrequencia != -1) {
        //       console.log('Amanhã terá coleta SELETIVA. Das ' + data.horario_inicio + ' às ' + data.horario_termino)
        //       client
        //       .sendText(message.from, 'Amanhã terá coleta SELETIVA. Das ' + data.horario_inicio + ' às ' + data.horario_termino)
        //       .then((result) => {
        //         console.log('Result: ', result); //return object success
        //       })
        //       .catch((erro) => {
        //         console.error('Error when sending: ', erro); //return object error
        //       });
        //     } else {
        //       console.log('Amanhã não tem coleta SELETIVA');
        //     }
        //   });
        // });
  
      }
    });
  }