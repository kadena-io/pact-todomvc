import Pact from 'pact-lang-api';

const KEY_PAIR = Pact.crypto.genKeyPair();

// API_HOST is defined by Webpack

export default async function sendPactCommand(cmd) {
  // Build the command JSON object
  const commandJSON = Pact.simple.exec.createCommand(KEY_PAIR, Date.now().toString(), cmd);

  // console.log(`Executing Pact command: ${cmd} with JSON:`, commandJSON);

  // Fire a POST to /api/v1/send and parse the response for Command hashes
  const commandResponse = await fetch(`${API_HOST}/api/v1/send`, {
    method: 'POST',
    body: JSON.stringify(commandJSON),
  });
  const commandResponseJSON = await commandResponse.json();

  if (commandResponseJSON.status === 'failure') {
    throw new Error(`PACT Failure in ${cmd}: ${commandResponseJSON.error}`);
  }

  // console.log('Listen for hash: ', commandJSON.cmds[0].hash);

  // Fire a POST to /api/v1/listen to listen for the result of a single command
  const listenResponse = await fetch(`${API_HOST}/api/v1/listen`, {
    method: 'POST',
    body: commandJSON.cmds[0].hash,
  });
  const listenResponseJSON = await listenResponse.json();

  if (
    listenResponseJSON.status === 'failure' ||
    listenResponseJSON.response.result.status === 'failure'
  ) {
    throw new Error(`PACT Failure in ${cmd} listen: ${listenResponseJSON.error}`);
  }

  return listenResponseJSON.response.result.data;
}
