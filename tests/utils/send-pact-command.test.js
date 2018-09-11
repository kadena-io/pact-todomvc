import Pact from 'pact-lang-api';

import sendPactCommand from '../../src/utils/send-pact-command';


const cmd = 'todos.read-todos';

const mockCommandSuccessJSON = {
  status: 'success',
  cmds: [ { hash: '123' } ]
};

const mockCommandErrorJSON = {
  status: 'failure',
  error: 'send error'
};

const mockListenSuccessJSON = {
  status: 'success',
  response: {
    result: {
      status: 'success',
      data: [ { id: 1 }, { id: 2 } ]
    }
  }
};

const mockListenErrorJSON = {
  status: 'failure',
  error: 'listen error',
  response: {
    result: {
      status: 'failure',
      error: 'listen error',
    }
  }
};

const mockSendCommandJSON = {
  cmds: [{
    cmd: `{"nonce":"nonce","payload":{"exec":{"code":"${cmd}","data":{}}}}`,
    hash: '123',
    sigs: [{
      pubKey: '123',
      sig: 'abc'
    }]
  }]
};

Pact.simple.exec.createCommand = jest.fn().mockReturnValue(mockSendCommandJSON);

describe('sendPactCommand()', () => {

  beforeEach(() => {
    Pact.simple.exec.createCommand = jest.fn().mockReturnValue(mockSendCommandJSON);
  });

  test('Should create a command JSON with the command passed and return', async () => {

    fetch.once(JSON.stringify(mockCommandSuccessJSON)).once(JSON.stringify(mockListenSuccessJSON));

    const data = await sendPactCommand(cmd);

    expect(Pact.simple.exec.createCommand).toHaveBeenCalledWith(
      { publicKey: expect.any(String), secretKey: expect.any(String) },
      expect.any(String),
      cmd
    );

    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/v1\/send$/);
    expect(fetch.mock.calls[0][1]).toEqual({
      method: 'POST', body: JSON.stringify(mockSendCommandJSON)
    });

    expect(fetch.mock.calls[1][0]).toMatch(/\/api\/v1\/listen$/);
    expect(fetch.mock.calls[1][1]).toEqual({
      method: 'POST', body: mockSendCommandJSON.cmds[0].hash
    });

    expect(data).toEqual(mockListenSuccessJSON.response.result.data);
  });

  test('Should throw if /send returns failure', async () => {
    fetch.once(JSON.stringify(mockCommandErrorJSON));
    const error = new Error(`PACT Failure in ${cmd}: ${mockCommandErrorJSON.error}`);
    await expect(sendPactCommand(cmd)).rejects.toEqual(error);
  });

  test('Should throw if /listen returns failure', async () => {
    fetch.once(JSON.stringify(mockCommandSuccessJSON)).once(JSON.stringify(mockListenErrorJSON));
    const error = new Error(`PACT Failure in ${cmd} listen: ${mockListenErrorJSON.error}`);
    await expect(sendPactCommand(cmd)).rejects.toEqual(error);
  });

});
