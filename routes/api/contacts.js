const express = require("express");
const {
  contactBodySchema,
  Contact,
  favoriteBodySchema,
} = require("../../models/contacts");
const { isValidObjectId } = require("mongoose");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const isValidId = isValidObjectId(contactId);
  if (!isValidId) {
    res.status(400).json({ message: `${contactId} isn't a valid id!` });
    return;
  }

  const contactById = await Contact.findById(contactId);

  if (!contactById) {
    res.status(404).json({ message: "Not Found" });
    return;
  }

  res.json(contactById);
});

router.post("/", async (req, res, next) => {
  const body = req.body;

  const { error } = contactBodySchema.validate(body);
  if (error) {
    res
      .status(400)
      .json({ message: `missing required ${error.details[0].path[0]} field` });
    return;
  }
  const newContact = await Contact.create(body);

  res.status(201).json(newContact);
});

router.delete("/:contactId", async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    res.status(400).json({ message: `${contactIdParam} isn't a valid id!` });
    return;
  }
  const removedContact = await Contact.findByIdAndDelete(contactIdParam);

  if (!removedContact) {
    res.status(404).json({ message: "Not Found" });
    return;
  }
  res.status(200).json({ message: "contact deleted" });
});

router.put("/:contactId", async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const body = req.body;
  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    res.status(400).json({ message: `${contactIdParam} isn't a valid id!` });
    return;
  }

  const { error } = contactBodySchema.validate(body);
  if (error) {
    res.status(400).json({ message: "missing fields" });
    return;
  }
  const updatedContact = await Contact.findByIdAndUpdate(contactIdParam, body, {
    new: true,
  });
  if (!updatedContact) {
    res.status(404).json({ message: "Not Found" });
    return;
  }

  res.json(updatedContact);
});
router.patch("/:contactId/favorite", async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const body = req.body;
  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    res.status(400).json({ message: `${contactIdParam} isn't a valid id!` });
    return;
  }

  const { error } = favoriteBodySchema.validate(body);
  if (error) {
    res.status(400).json({ message: "missing field favorite" });
    return;
  }
  const updatedContact = await Contact.findByIdAndUpdate(contactIdParam, body, {
    new: true,
  });

  if (!updatedContact) {
    res.status(404).json({ message: "Not Found" });
    return;
  }

  res.json(updatedContact);
});

module.exports = router;
