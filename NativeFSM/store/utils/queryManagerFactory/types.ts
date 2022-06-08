import { InterpreterFrom } from 'xstate';
import { queryMachineFactory, Config } from '../queryMachine';

class QueryServiceHelper<ResultType> {
  Return = queryMachineFactory<ResultType>({} as Config);
}

export type QueryMachine<ResultType> = QueryServiceHelper<ResultType>['Return'];

export type QueryService<ResultType> = InterpreterFrom<
  QueryServiceHelper<ResultType>['Return']
>;
