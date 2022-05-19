import { interpret } from 'xstate';
import nock from 'nock';

import { itemBuilder } from '../../../../test/mocks/item';
import { FSMDetailsScreenMachine } from './machine';

describe('FSMDetailsScreenMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach loading', (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get(`/items/${item.id}`).reply(200, item);
    const fetchService = interpret(FSMDetailsScreenMachine).onTransition(
      (state) => {
        if (state.matches('loading')) {
          done();
        }
      },
    );

    fetchService.start();
    fetchService.send({ type: 'FETCH', id: item.id });
  });

  it('should eventually reach success', (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000').get(`/items/${item.id}`).reply(200, item);
    const fetchService = interpret(FSMDetailsScreenMachine).onTransition(
      (state) => {
        if (state.matches('success')) {
          done();
        }
      },
    );

    fetchService.start();
    fetchService.send({ type: 'FETCH', id: item.id });
  });

  it('should eventually reach error', (done) => {
    const item = itemBuilder();
    nock('http://localhost:9000')
      .get(`/items/${item.id}`)
      .reply(500, { error: { message: 'Something went wrong' } });
    const fetchService = interpret(FSMDetailsScreenMachine).onTransition(
      (state) => {
        if (state.matches('error')) {
          done();
        }
      },
    );

    fetchService.start();
    fetchService.send({ type: 'FETCH', id: item.id });
  });
});
