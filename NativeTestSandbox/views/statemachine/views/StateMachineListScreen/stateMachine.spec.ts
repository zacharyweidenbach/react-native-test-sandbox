import { interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../../test/mocks/item';
import { fetchMachine } from './stateMachine';

describe('stateMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach loading', (done) => {
    nock('http://localhost:9000').get('/items').reply(200, []);
    const fetchService = interpret(fetchMachine).onTransition((state) => {
      if (state.matches('loading')) {
        done();
      }
    });

    fetchService.start();
    fetchService.send({ type: 'FETCH' });
  });

  it('should eventually reach successWithContent', (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get('/items').reply(200, [item]);
    const fetchService = interpret(fetchMachine).onTransition((state) => {
      if (state.matches('successWithContent')) {
        done();
      }
    });

    fetchService.start();
    fetchService.send({ type: 'FETCH' });
  });

  it('should eventually reach successNoContent', (done) => {
    nock('http://localhost:9000').get('/items').reply(200, []);
    const fetchService = interpret(fetchMachine).onTransition((state) => {
      if (state.matches('successNoContent')) {
        done();
      }
    });

    fetchService.start();
    fetchService.send({ type: 'FETCH' });
  });

  it('should eventually reach error', (done) => {
    nock('http://localhost:9000')
      .get('/items')
      .reply(500, { error: { message: 'Something went wrong' } });
    const fetchService = interpret(fetchMachine).onTransition((state) => {
      if (state.matches('error')) {
        done();
      }
    });

    fetchService.start();
    fetchService.send({ type: 'FETCH' });
  });
});
