/* eslint-disable no-console */
import { connectDB, disconnectDB } from '../src/config/db.js';
import * as models from '../src/models/index.js';

const run = async () => {
  await connectDB();

  try {
    for (const [name, Model] of Object.entries(models)) {
      await Model.syncIndexes();
      const indexes = await Model.collection.indexes();
      console.log(`\n${name}`);
      indexes.forEach((index) => {
        const flags = [index.unique && 'unique', index.partialFilterExpression && 'partial']
          .filter(Boolean)
          .join(', ');
        console.log(`  ${JSON.stringify(index.key)}${flags ? ` (${flags})` : ''}`);
      });
    }
  } finally {
    await disconnectDB();
  }
};

run().catch((error) => {
  console.error('Index sync failed:', error);
  process.exit(1);
});
