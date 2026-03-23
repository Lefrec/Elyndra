/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2479230031")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number758348182",
    "max": null,
    "min": null,
    "name": "maxHP",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3495065483",
    "max": null,
    "min": null,
    "name": "currentHP",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2479230031")

  // remove field
  collection.fields.removeById("number758348182")

  // remove field
  collection.fields.removeById("number3495065483")

  return app.save(collection)
})
