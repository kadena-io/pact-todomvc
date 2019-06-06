import Pact from 'pact-lang-api';

const KEY_PAIR = Pact.crypto.genKeyPair();

// API_HOST is defined by Webpack

export default async function sendPactCommand(cmd) {
  // Build the command JSON object
  // const listenJSON = Pact.simple.exec.createListenRequest(KEY_PAIR, Date.now().toString(), cmd);
  const meta = Pact.lang.mkMeta("", "", 0, 0)
  const commandJSON = Pact.simple.exec.createCommand(KEY_PAIR, Date.now().toString(), cmd, null, meta);
  // console.log(`Executing Pact command: ${cmd} with JSON:`, commandJSON);

  // Fire a POST to /api/v1/send and parse the response for Command hashes
  const commandResponse = await fetch(`${API_HOST}/api/v1/send`, {
    headers: {
      // 'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(commandJSON),
  });
  const commandResponseJSON = await commandResponse.json();


  if (commandResponseJSON.status === 'failure') {
    throw new Error(`PACT Failure in ${cmd}: ${commandResponseJSON.error}`);
  }

  // console.log('Listen for hash: ', commandJSON.cmds[0].hash);

  // Fire a POST to /api/v1/listen to listen for the result of a single command

  const listenCmd = Pact.simple.exec.createListenRequest(commandJSON);
  const listenResponse = await fetch(`${API_HOST}/api/v1/listen`, {
    headers: {
      // 'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ listen: listenCmd.requestKey}),
  });
  const listenResponseJSON = await listenResponse.json();
  if (
    listenResponseJSON.status === 'failure' ||
    listenResponseJSON.result.status === 'failure'
  ) {
    throw new Error(`PACT Failure in ${cmd} listen: ${listenResponseJSON.error}`);
  }

  return listenResponseJSON.result.data;
}
