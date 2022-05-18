import { interpret } from 'xstate';
import nock from 'nock';

import { fetchMachine, defaultContext } from './fetchMachine';

describe('fetchMachine', () => {
  afterEach(async () => {
    nock.cleanAll();
  });

  it('should eventually reach fetching', (done) => {
    nock('http://localhost:9000').get('/test').reply(200, { test: 'test' });
    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('fetching')) {
        done();
      }
    });

    fetchService.start();
  });

  it('should eventually reach success', (done) => {
    const spyFn = jest.fn();
    nock('http://localhost:9000')
      .get('/test')
      .reply(200, () => {
        spyFn();
        return { test: 'test' };
      });

    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('success')) {
        expect(spyFn).toHaveBeenCalledTimes(1);
        expect(state.context.result).toEqual({ test: 'test' });
        done();
      }
    });

    fetchService.start();
  });

  it('should eventually reach error and have retried', (done) => {
    const spyFn = jest.fn();
    nock('http://localhost:9000')
      .persist()
      .get('/test')
      .reply(500, () => {
        spyFn();
        return { error: { message: 'Oh no! An error!' } };
      });

    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('error')) {
        expect(spyFn).toHaveBeenCalledTimes(3);
        expect(state.context.error === 'Oh no! An error!');
        done();
      }
    });

    fetchService.start();
  });

  it('should eventually reach error and use default error', (done) => {
    const spyFn = jest.fn();
    nock('http://localhost:9000')
      .persist()
      .get('/test')
      .reply(500, () => {
        spyFn();
        return {};
      });

    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('error')) {
        expect(spyFn).toHaveBeenCalledTimes(3);
        expect(state.context.error === 'Something went wrong');
        done();
      }
    });

    fetchService.start();
  });

  it('should eventually reach error after failed refresh token try', (done) => {
    const spyFnIntendedEndpoint = jest.fn();
    const spyFnRefreshEndpoint = jest.fn();

    nock('http://localhost:9000')
      .get('/test')
      .reply(401, () => {
        spyFnIntendedEndpoint();
        return {};
      });

    nock('http://localhost:9000')
      .post('/refresh-token')
      .reply(500, () => {
        spyFnRefreshEndpoint();
        return { error: { message: 'Failed to refresh.' } };
      });

    const fetchService = interpret(
      fetchMachine.withContext({ ...defaultContext, path: 'test' }),
    ).onTransition((state) => {
      if (state.matches('error')) {
        expect(spyFnIntendedEndpoint).toHaveBeenCalledTimes(1);
        expect(spyFnRefreshEndpoint).toHaveBeenCalledTimes(1);
        expect(state.context.error === 'Failed to refresh.');
        done();
      }
    });

    fetchService.start();
  });
});
