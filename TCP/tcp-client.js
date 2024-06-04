const net = require("net");
const fs = require("fs");
const path = require("path");
const { performance, PerformanceObserver } = require("perf_hooks");

// Função para exibir métricas de performance
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});
obs.observe({ entryTypes: ['measure'] });

// Função para gerar um arquivo de 100MB
function generateLargeFile(filename, sizeInMB) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, "A");
  fs.writeFileSync(filename, buffer);
  console.log(`Arquivo ${filename} de ${sizeInMB}MB gerado.`);
}

const client = net.createConnection({ port: 3000 }, () => {
  console.log("Conectado ao servidor.");

  // Gerar o arquivo de 100MB
  const filename = "./TCP/arquivo.txt";
  generateLargeFile(filename, 100);

  performance.mark('start-read-file');
  // Ler o arquivo de texto e enviar para o servidor
  const filePath = path.join(filename);
  const fileData = fs.readFileSync(filePath);
  performance.mark('end-read-file');
  performance.measure('Reading File', 'start-read-file', 'end-read-file');

  performance.mark('start-send-file');
  client.write(fileData);
  client.end();
  performance.mark('end-send-file');
  performance.measure('Sending File', 'start-send-file', 'end-send-file');
});

client.on("data", (data) => {
  console.log("Arquivo zip recebido do servidor.");
  const outputFilePath = path.join(__dirname + "/TCP", "output_file.zip");
  performance.mark('start-save-zip');
  fs.writeFileSync(outputFilePath, data);
  performance.mark('end-save-zip');
  performance.measure('Saving Zip', 'start-save-zip', 'end-save-zip');
  console.log("Arquivo zip salvo como", outputFilePath);
  client.end();
});

client.on("end", () => {
  console.log("Desconectado do servidor.");
});

client.on("error", (err) => {
  console.error("Erro no cliente:", err);
});
