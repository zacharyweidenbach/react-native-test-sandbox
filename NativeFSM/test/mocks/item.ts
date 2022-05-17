import { build, fake } from '@jackfranklin/test-data-bot';
import nock from 'nock';

import { Item } from '../../types';

export const itemBuilderRaw = build<Item>({
  fields: {
    id: fake((f) => f.random.uuid()),
    firstName: fake((f) => f.name.firstName()),
    lastName: fake((f) => f.name.lastName()),
    teamColor: fake((f) =>
      f.random.arrayElement(['blue', 'green', 'yellow', 'red']),
    ),
    createdAt: fake((f) => f.date.recent()),
  },
});

export const itemBuilder = (overrides: Partial<Item> = {}) => {
  return itemBuilderRaw({ overrides });
};

export const mockItemsEndpoint = (items: Item[]) => {
  return nock('http://localhost:9000').get('/items').reply(200, items);
};

export const mockItemEndpoint = (item: Item) => {
  return nock('http://localhost:9000')
    .get(`/items/${item.id}`)
    .reply(200, item);
};
