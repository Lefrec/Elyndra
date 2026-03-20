/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2829451805")

  // remove field
  collection.fields.removeById("text3981121951")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select3981121951",
    "maxSelect": 1,
    "name": "class",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "knight",
      "mage",
      "shadow",
      "alchemist"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2829451805")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3981121951",
    "max": 0,
    "min": 0,
    "name": "class",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select3981121951")

  return app.save(collection)
})
