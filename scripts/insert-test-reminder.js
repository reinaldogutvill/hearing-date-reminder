const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;;
const dbName = "test"; // or whatever the correct DB name is — could be `test`, `reminders`, or something you’ve used

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName); // make sure this matches the one used in production
    const reminders = db.collection("reminders");

    const testReminder = {
      name: "Gogo Test",
      aNumber: "A123456789",
      email: "gogo@example.com",
      hearingDate: new Date("2025-06-01"),
      createdAt: new Date(),
      updateToken: "test12345",
      reminderSent: false,
      monthsReminded: [],
      isUnsubscribed: false,
    };

    const result = await reminders.insertOne(testReminder);
    console.log("✅ Inserted test reminder into Atlas with ID:", result.insertedId);
  } catch (err) {
    console.error("❌ Error inserting reminder:", err);
  } finally {
    await client.close();
  }
}

run();
