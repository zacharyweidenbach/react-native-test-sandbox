import supertest from "supertest";

import { testApp, testServer, testPort } from "./testApp";

const itemId = "1c4ffda6-0e44-4176-908c-f87d6915b272";

describe("/items/:id (e2e)", () => {
  beforeEach(() => {
    if (!testServer.listenerCount) testServer.listen(testPort);
  });

  afterEach(() => {
    testServer.close();
  });

  it("GET /items/:id returns an item", async () => {
    await supertest(testApp)
      .get(`/items/${itemId}`)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toEqual(itemId);
      });
  });
});
