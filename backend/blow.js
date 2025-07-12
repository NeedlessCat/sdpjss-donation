import khandanModel from "./models/khandanModel.js";
import userModel from "./models/userModel.js";

// Run this once to add createdAt to existing documents
await khandanModel.updateMany(
  { createdAt: { $exists: false } },
  { $set: { createdAt: new Date() } }
);

await userModel.updateMany(
  { createdAt: { $exists: false } },
  { $set: { createdAt: new Date() } }
);
