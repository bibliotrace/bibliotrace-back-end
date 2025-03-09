import DaoFactory from "../src/db/dao/DaoFactory";
import TestConnectionManager from "./TestConnectionManager";

export let testDaoFactory: DaoFactory;

export default async function setup() {
  // TODO: add Dynamo initialization stuff here because I have no idea how that is working currently
  console.log("Setting up test environment");
  await TestConnectionManager.initialize();
  console.log("Test database connection established");
  await TestConnectionManager.runCreateTestSQL();
  console.log("Creation of test database schema complete");

  testDaoFactory = new DaoFactory(TestConnectionManager.kyselyDB);

  console.log("Dependencies Instantiated");
}
