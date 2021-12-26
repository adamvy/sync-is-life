let readChannel = new SharedArrayBuffer(2000);
let writeChannel = new SharedArrayBuffer(2000);

function write(obj) {
  let data = new TextEncoder().encode(JSON.stringify(obj));
  const offset = 8;

  if (data.length > writeChannel.byteLength - offset)
    throw new Error("message too long");

  let view1 = new Uint32Array(writeChannel);
  let view2 = new Uint8Array(writeChannel);

  view1[1] = data.length;

  for (let i = 0; i < data.length; i++) {
    view2[i + offset] = data[i];
  }

  Atomics.store(view1, 0, 1);

  while (Atomics.load(view1, 0) != 0) {}
}

function read(obj) {
  const offset = 8;

  let view1 = new Uint32Array(readChannel);

  while (Atomics.load(view1, 0) != 1) {}

  let length = view1[1];

  if (length > readChannel.byteLength - offset)
    throw new Error("message too long");

  let view2 = new Uint8Array(readChannel);
  let buffer = new Uint8Array(length);

  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = view2[i + offset];
  }

  Atomics.store(view1, 0, 0);

  return JSON.parse(new TextDecoder().decode(buffer));
}

function workerMain() {
  self.onmessage = function (msg) {
    let data = msg.data;
    self.readChannel = data.readChannel;
    self.writeChannel = data.writeChannel;

    console.log("Worker initialized with", self.readChannel, self.writeChannel);

    {
      let msg = read();
      write(msg);
    }
  };
}

let workerScript = URL.createObjectURL(
  new Blob([
    `
${read.toString()}
${write.toString()}
${workerMain.toString()}
workerMain();
`,
  ])
);

let worker = new Worker(workerScript);
worker.postMessage({
  writeChannel: readChannel,
  readChannel: writeChannel,
});

setTimeout(() => {
  write("hello");

  console.log("Worker says", read());
}, 0);
