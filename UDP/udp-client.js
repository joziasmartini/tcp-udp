const dgram = require("dgram");
const fs = require("fs");

// Função para gerar um arquivo de 100MB
function generateLargeFile(filename, sizeInMB) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, "A");
  fs.writeFileSync(filename, buffer);
  console.log(`Arquivo ${filename} de ${sizeInMB}MB gerado.`);
}

// Gerar o arquivo de 100MB
const filename = "./UDP/arquivo.txt";
generateLargeFile(filename, 100);

// Ler arquivo do disco
const fileData = fs.readFileSync(filename);

const udpClient = dgram.createSocket("udp4");

// Função para enviar arquivo em pedaços via UDP
function sendFileInChunks(fileData, chunkSize, port, address) {
  let offset = 0;

  function sendNextChunk() {
    const end = Math.min(offset + chunkSize, fileData.length);
    const chunk = fileData.slice(offset, end);

    udpClient.send(chunk, 0, chunk.length, port, address, (err) => {
      if (err) throw err;

      console.log(`Enviado pedaço de ${chunk.length} bytes.`);

      offset += chunkSize;
      if (offset < fileData.length) {
        sendNextChunk();
      } else {
        console.log("Arquivo inteiro enviado para o servidor UDP.");
        udpClient.close();
      }
    });
  }

  sendNextChunk();
}
// Daniel Pierrelus 
// Receber o arquivo compactado do servidor
const receivedChunks = [];

udpClient.on("message", (msg) => {
  receivedChunks.push(msg);
  console.log(`Fragmento de ${msg.length} bytes recebido do servidor.`);

  // Verificar se o último fragmento foi recebido
  if (msg.length < CHUNK_SIZE) {
    const compressedFilename = "./UDP/received_file.gz";
    const fileBuffer = Buffer.concat(receivedChunks);
    fs.writeFileSync(compressedFilename, fileBuffer);
    console.log(`Arquivo compactado recebido do servidor e salvo como ${compressedFilename}`);
    udpClient.close();
  }
});
// --------------------
// Defina o tamanho do pedaço (em bytes)
const CHUNK_SIZE = 1400; // 1400 bytes para evitar fragmentação

sendFileInChunks(fileData, CHUNK_SIZE, 3000, "localhost");