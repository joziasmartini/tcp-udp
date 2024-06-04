const net = require("net");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const { performance, PerformanceObserver } = require("perf_hooks");

// Função para exibir métricas de performance
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});
obs.observe({ entryTypes: ['measure'] });

const server = net.createServer((socket) => {
  console.log("Cliente conectado.");

  let fileData = Buffer.alloc(0);

  socket.on("data", (data) => {
    fileData = Buffer.concat([fileData, data]);
  });

  socket.on("end", () => {
    console.log("Arquivo recebido.");

    const inputFilePath = path.join(__dirname, "received_file.txt");
    const outputFilePath = path.join(__dirname, "output_file.zip");

    performance.mark('start-write-file');
    // Salvar o arquivo recebido no disco
    fs.writeFileSync(inputFilePath, fileData);
    performance.mark('end-write-file');
    performance.measure('Writing File', 'start-write-file', 'end-write-file');

    performance.mark('start-create-zip');
    // Criar o arquivo zip
    const input = fs.createReadStream(inputFilePath);
    const output = fs.createWriteStream(outputFilePath);
    const zip = zlib.createGzip();

    input
      .pipe(zip)
      .pipe(output)
      .on("finish", () => {
        performance.mark('end-create-zip');
        performance.measure('Creating Zip', 'start-create-zip', 'end-create-zip');
        console.log("Arquivo zip criado.");

        performance.mark('start-read-zip');
        // Ler o arquivo zip e enviar de volta para o cliente
        const zipData = fs.readFileSync(outputFilePath);
        performance.mark('end-read-zip');
        performance.measure('Reading Zip', 'start-read-zip', 'end-read-zip');

        socket.write(zipData);
        socket.end();
      });
  });

  socket.on("error", (err) => {
    console.error("Erro no socket:", err);
  });

  socket.on("close", () => {
    console.log("Conexão com o cliente encerrada.");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
