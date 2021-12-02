const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

const day = require(__dirname + "/date.js");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(
  "mongodb+srv://admin:rishi!12345@cluster0.kvkb4.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
app.set("view engine", "ejs");
//schema
const itemSchema = new mongoose.Schema({
  name: String,
});
const listSchema = {
  name: String,
  itemArray: [itemSchema],
};
//models
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
//elements
const item1 = new Item({
  name: "This is your to-do list",
});
const item2 = new Item({
  name: "Type and add on + to add an item",
});
const item3 = new Item({
  name: "<-- check this to delete the item from the list",
});
const defaultItems = [item1, item2, item3];
//routes
app.get("/", function (req, res) {
  Item.find({}, function (err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successful");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { kindOfDay: "Today", itemList: items });
      }
    }
  });
});
//general lists
app.get("/:topic", function (req, res) {
  let topic = req.params.topic;
  if (topic == "Today") {
    redirect("/");
  }
  List.findOne({ name: topic }, function (err, foundItem) {
    if (!err) {
      if (!foundItem) {
        let newList = new List({
          name: topic,
          itemArray: defaultItems,
        });
        console.log("yes");
        newList.save();
        res.redirect("/" + topic);
      } else {
        let array = foundItem.itemArray;
        if (array.length === 0) {
          List.updateOne(
            { name: topic },
            { $push: { itemArray: defaultItems } },
            function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("successfully updated");
                res.redirect("/" + topic);
              }
            }
          );
        } else {
          res.render("list", {
            kindOfDay: topic,
            itemList: foundItem.itemArray,
          });
        }
      }
    } else {
      console.log(err);
    }
  });
});

app.post("/:topic", function (req, res) {
  let topic = req.params.topic;
  var item = req.body.todo1;
  const newItem = new Item({
    name: item,
  });
  if (topic == "Today") {
    newItem.save();
    res.redirect("/");
  }
  List.updateOne(
    { name: topic },
    { $push: { itemArray: newItem } },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully updated");
      }
    }
  );
  console.log(topic);
  res.redirect("/" + topic);
});
app.post("/delete/:topic", function (req, res) {
  let topic = req.params.topic;
  const jsobj = req.body;
  console.log({ name: Object.keys(jsobj)[0] });
  if (topic == "Today") {
    Item.deleteOne({ name: Object.keys(jsobj)[0] }, function (err) {
      if (err) {
        console.log(err);
      } else {
      }
    });
    res.redirect("/");
  }
  List.updateOne(
    { name: topic },
    { $pull: { itemArray: { name: Object.keys(jsobj)[0] } } },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successful");
      }
    }
  );
  res.redirect("/" + topic);
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {});
