import supertest from "supertest";

import { app, port, server } from "../src/index";

describe("/items (e2e)", () => {
  beforeEach(() => {
    if (!server.listenerCount) server.listen(port);
  });

  afterEach(() => {
    server.close();
  });
  it("GET /items returns all items", async () => {
    await supertest(app)
      .get("/items")
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBeTruthy();
      });
  });
});
