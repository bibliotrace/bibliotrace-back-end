import TestConnectionManager from "./TestConnectionManager";

export default async function setup() {
  console.log("Setting up test environment");
  await TestConnectionManager.initialize();
  console.log("Test database connection established");
  await TestConnectionManager.runCreateTestSQL();
  console.log("Creation of test database schema complete");
}
