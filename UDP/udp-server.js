const dgram = require("dgram");
const zlib = require("zlib");
const fs = require("fs");

const udpServer = dgram.createSocket("udp4");

let receivedChunks = [];
let expectedChunks = 0;
let receivedBytes = 0;
let isClosing = false; // Flag para controlar o fechamento do servidor
let isProcessing = false; // Flag para controlar o processamento do arquivo

udpServer.on("message", (msg, rinfo) => {
  console.log(
    `Servidor UDP recebeu ${msg.length} bytes de ${rinfo.address}:${rinfo.port}`
  );

  // Se já estivermos processando o arquivo, ignorar novos pacotes
  if (isProcessing) {
    return;
  }

  receivedChunks.push(msg);
  receivedBytes += msg.length;

  if (receivedBytes >= expectedChunks) {
    const completeFileBuffer = Buffer.concat(receivedChunks);

    isProcessing = true; // Marcar que estamos processando o arquivo

    zlib.gzip(completeFileBuffer, (err, compressedData) => {
      if (err) throw err;

      fs.writeFileSync("./UDP/arquivo_comprimido.zip", compressedData);
      console.log("Arquivo comprimido gerado.");

      //Daniel Pierrelus
      
      // Enviar arquivo comprimido de volta ao cliente
      let offset = 0;
      const CHUNK_SIZE = 1400;

      function sendNextChunk() {
        const end = Math.min(offset + CHUNK_SIZE, compressedData.length);
        const chunk = compressedData.slice(offset, end);

        udpServer.send(chunk, 0, chunk.length, rinfo.port, rinfo.address, (err) => {
          if (err) throw err;

          console.log(`Enviado pedaço de ${chunk.length} bytes para ${rinfo.address}:${rinfo.port}.`);

          offset += CHUNK_SIZE;
          if (offset < compressedData.length) {
            sendNextChunk();
          } else {
            console.log("Arquivo comprimido inteiro enviado para o cliente.");
            // -------------------

          // Verificar se o servidor está fechando antes de tentar fechar novamente
          if (!isClosing) {
            isClosing = true;
            udpServer.close();
          }
        }
        //}
     // );
    });
  }
//});
  sendNextChunk();

  });
  }
});

udpServer.on("close", () => {
  console.log("Servidor UDP fechado.");
});

udpServer.on("error", (err) => {
  console.error("Erro no servidor UDP:", err);
  udpServer.close();
});

udpServer.on("listening", () => {
  const address = udpServer.address();
  console.log(`Servidor UDP escutando na porta ${address.port}...`);
});

udpServer.bind(3000);