import { connect, connection, set } from 'mongoose';
import { pick, Prosper, Variant } from "@bkknights/prosper";
import { Experiment } from "./experiment";

set('strictQuery', true);

run()
  .then(() => process.exit(1))
  .catch(err => {
    console.log(err);
    return dropAll().then(() => process.exit(0));
  });

const greetProvider = Symbol("greet-provider");

interface IGreetProvider {
  greeting: string;
}

class BaseGreeting {
  greeting = "Hello World";
}
class MomGreeting {
  greeting = "Hello Mom";
}
class DadGreeting {
  greeting = "Hello Dad";
}

const variant1 = new Variant("1", {
  [greetProvider]: new BaseGreeting(),
});
const variant2 = new Variant("2", {
  [greetProvider]: new MomGreeting(),
});
const variant3 = new Variant("3", {
  [greetProvider]: new DadGreeting(),
});
const experiment = new Experiment("profiling", [variant1, variant2, variant3]);

const prosper = new Prosper<Experiment>();
prosper.with(experiment);

class Thing {
  prosper = prosper;
  @pick(greetProvider) greetProvider: IGreetProvider;
  greet() {
    return this.greetProvider.greeting;
  }
}

async function run() {
  // 4. Connect to MongoDB
  await connect('mongodb://127.0.0.1:27017');
  await dropAll();
  await experiment.enable();
  for (let i = 0; i < 1000; i++) {
    const userId = (Math.random() * 10000).toString();
    await experiment.setForUser(userId);
    const thing = new Thing();
    console.log(i, thing.greet());
    await experiment.completeForUser(userId, 1);
  }
  await experiment.disable();
  await dropAll();
}

async function dropAll() {
  const collections = await connection.db.collections();
  if (typeof collections === 'undefined') return;
  for (let collection of collections) {
    await collection.drop();
  }
}
