 //https://secure-beach-80789.herokuapp.com/

//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin_khushi:password@cluster0.2srfo.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"working"
})
const item2 = new Item({
  name:"having lunch"
})
const item3 = new Item({
  name:"setting the table"
})
const defaulttodoitems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);


// Item.deleteMany({_id:"60d075e5561804533c81c5e5"},function(err){
//   if(err) console.log(err);
//   else console.log("successfully deleted the items into the db");
// });


app.get("/", function(req, res) {

const day = date.getDate();

Item.find(function(err,foundItems){
  if(foundItems.length === 0)
  {
    Item.insertMany(defaulttodoitems,function(err){
      if(err) console.log(err);
      else console.log("successfully inserted the items into the db");
      res.redirect("/");
    })
  }
    res.render("list", {listTitle: day, newListItems: foundItems});
})

});

app.get("/:customListName",function(req,res){
  const customListName = lodash.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundItems){
    if(!err){
      if(!foundItems)
      {
        const defaultlist = new List({
          name: customListName,
          items: defaulttodoitems
        })
        defaultlist.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: customListName, newListItems: foundItems.items});
      }
    }
  })
})



app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: item
  });


   if(listName === date.getDate())
   {
     newItem.save();
     res.redirect("/");
   }
   else{
     List.findOne({name: listName},function(err,foundItems){
       foundItems.items.push(newItem);
       foundItems.save();
      res.redirect("/"+listName);
     })

   }

});



app.post("/delete",function(req,res){
  const todeleteid = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === date.getDate())
  {
    Item.deleteOne({_id:todeleteid},function(err){
      if(!err) console.log("deleted successfully");
      res.redirect("/");
  })
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:todeleteid}}},{useFindAndModify:false},function(err,result){
      if(!err)
      res.redirect("/"+listName);
    })
  }
});







app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
