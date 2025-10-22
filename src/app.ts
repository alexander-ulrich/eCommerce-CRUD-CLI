import { db } from "#db";
import { BSON } from "bson";
import { Command } from "commander";

const program = new Command();
program
  .name("ecommerce-cli")
  .description(
    "Simple product CRUD CLI - use 'npm start <command> <arguments> to interact with the product list'"
  )
  .version("1.0.0");

// ADD
program
  .command("add")
  .description("Add a new product")
  .argument("<name>", "Product name")
  .argument("<stock>", "Stock quantity")
  .argument("<price>", "Product price")
  .argument("<tags>", "<tag1,tag2,...")
  .action(
    async (name: string, stockStr: string, priceStr: string, tags: string) => {
      try {
        const stock = Number(stockStr);
        const price = Number(priceStr);
        const collection = db.collection("products");
        const doc = {
          name: name,
          stock: stock,
          price: price,
          tags: tags.split(","),
          created_at: new Date(),
        };
        const result = await collection.insertOne(doc);
        console.log(
          "CLI application was called with add command with arguments:",
          {
            name,
            stock,
            price,
            tags,
          },
          "the new product with the ID: " +
            result.insertedId +
            " was successfully added!"
        );
      } catch (error) {
        if (error instanceof Error) console.log("ERROR:" + error.message);
      } finally {
        process.exit(0);
      }
    }
  );

// LIST
program
  .command("list")
  .description("List all products")
  .action(async () => {
    try {
      const collection = db.collection("products");
      const productList = await collection.find({}).toArray();
      console.log("CLI application was called with list command");
      console.log(productList);
    } catch (error) {
      if (error instanceof Error) console.log("ERROR:" + error.message);
    } finally {
      process.exit(0);
    }
  });

// GET
program
  .command("get")
  .description("Get product by ID")
  .argument("<id>", "Product ID")
  .action(async (idStr: string) => {
    try {
      const id = new BSON.ObjectId(idStr);
      const collection = db.collection("products");
      const productByID = await collection.findOne({ _id: id });
      console.log("CLI application was called with get command");
      console.log(productByID);
    } catch (error) {
      if (error instanceof Error) console.log("ERROR:" + error.message);
    } finally {
      process.exit(0);
    }
  });

// SEARCH
program
  .command("search")
  .description("Get products by tag")
  .argument("<tag>", "Product tag")
  .action(async (tag: string) => {
    try {
      const collection = db.collection("products");
      const productsByTag = await collection
        .find({ tags: { $all: [tag] } })
        .toArray();
      console.log("CLI application was called with search command");
      console.log(productsByTag);
    } catch (error) {
      if (error instanceof Error) console.log("ERROR:" + error.message);
    } finally {
      process.exit(0);
    }
  });

// UPDATE
program
  .command("update")
  .description("Update product by ID")
  .argument("<id>", "Product ID")
  .argument("<name>", "Product name")
  .argument("<stock>", "Stock quantity")
  .argument("<price>", "Product price")
  .argument("<tags>", "<tag1,tag2,...")
  .action(
    async (
      idStr: string,
      name: string,
      stockStr: string,
      priceStr: string,
      tags: string
    ) => {
      try {
        const id = new BSON.ObjectId(idStr);
        const stock = Number(stockStr);
        const price = Number(priceStr);
        const collection = db.collection("products");
        const doc = {
          name: name,
          stock: stock,
          price: price,
          tags: tags.split(","),
        };
        const result = await collection.updateOne({ _id: id }, { $set: doc });
        if (result.acknowledged)
          console.log(
            "CLI application was called with update command with arguments:",
            {
              name,
              stock,
              price,
              tags,
            },
            ",",
            "the product was successfully updated!"
          );
      } catch (error) {
        if (error instanceof Error) console.log("ERROR:" + error.message);
      } finally {
        process.exit(0);
      }
    }
  );

// DELETE
program
  .command("delete")
  .description("Delete product by ID")
  .argument("<id>", "Product ID")
  .action(async (idStr: string) => {
    try {
      const id = new BSON.ObjectId(idStr);
      const collection = db.collection("products");
      const result = await collection.deleteOne({ _id: id });
      if (result.acknowledged)
        console.log(
          "CLI application was called with delete command:",
          "the product was successfully deleted!"
        );
    } catch (error) {
      if (error instanceof Error) console.log("ERROR:" + error.message);
    } finally {
      process.exit(0);
    }
  });

program.hook("postAction", () => process.exit(0));
program.parse();
