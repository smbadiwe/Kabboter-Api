import chaiHttp from "chai-http";
import chai from "chai";
import app from "../src/app";

chai.use(chaiHttp);
const expect = chai.expect;

describe("App.js tests", () => {
  it("Hello world works", async () => {
    const response = await chai.request(app.callback()).get("/");
    expect(response.status).to.equal(200);
    expect(response.text).to.equal("Hello world!");
  });
});
