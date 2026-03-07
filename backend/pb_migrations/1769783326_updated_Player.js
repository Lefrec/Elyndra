/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2829451805")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number375216478",
    "max": null,
    "min": null,
    "name": "maxHP",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3946600259",
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
  const collection = app.findCollectionByNameOrId("pbc_2829451805")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number375216478",
    "max": null,
    "min": null,
    "name": "maxHp",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3946600259",
    "max": null,
    "min": null,
    "name": "currentHp",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
