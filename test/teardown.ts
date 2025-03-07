import TestConnectionManager from "./TestConnectionManager";

export default async function teardown() {
  console.log("Tearing down test environment");
  await TestConnectionManager.teardownDb();
  await TestConnectionManager.closeConnection();
}
