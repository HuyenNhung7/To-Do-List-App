//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")
const app = express();

mongoose.connect(process.env.MONGO_CONNECT_STRING)

const itemSchema = new mongoose.Schema({
  name: String
})

const Item = new mongoose.model("Item", itemSchema)

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
const item1 = new Item({
  name: "Wellcome to your ToDoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultList = [item1, item2, item3];
const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();

  Item.find().then((items)=>{
    if(items.length !== 0) {
      res.render("list", {listTitle: day, newListItems: items});
    } else {
      
      Item.insertMany(defaultList)
      res.redirect("/")
    }
  })

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  // console.log(req.body)
  List.findOne({name: req.body.list}).then(async(foundList)=>{
    if(foundList){
      // console.log(foundList)
      if(foundList.items) {
        foundList.items.push({name: item})
        await foundList.save()
      }
      res.redirect(`/custom/${foundList.name}`);
    } else {
      const insertItem = new Item({
        name: item,
      });
      // console.log("no no")
      insertItem.save()
      res.redirect("/");
    }
  })
});

app.post("/delete",(req, res)=>{
  // console.log(req.body)

  List.findOne({name: req.body.name}).then(async(getList)=>{
    // console.log(getList)
    if(getList) {
      // console.log("you so stp")
      if(getList.items) {
        getList.items.pull({_id: req.body.id})
        await getList.save();
      }
      res.redirect(`/custom/${req.body.name}`)
    } else {
      Item.findByIdAndDelete(req.body.id).then(()=>{
        console.log("delete success!")
      }).catch((err)=>{
        console.log(err)
      })
      res.redirect("/")
    }
  }).catch (err=>console.log(err))
})

app.get("/custom/:customListName", (req, res)=>{
  const customListName =  _.capitalize(string=req.params.customListName);
  console.log("customListName: "+customListName)
  List.findOne({name: customListName}).then((foundList)=>{
    // console.log(foundList)
    if(foundList){
      console.log("Exist!")
      // console.log(foundList)

      res.render("list",{
        listTitle: foundList.name,
        newListItems: foundList.items
      })
    } else {
      console.log("Doesn't exist!")
      console.log(customListName)
      const list = new List({
        name: customListName,
        items: defaultList
      })
      list.save()
      res.redirect("/")
    }
  }).catch(err => {
    console.log(err)
  } )
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
