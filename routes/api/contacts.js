const express = require("express");
const {
  contactBodySchema,
  Contact,
  favoriteBodySchema,
} = require("../../models/contacts");
const { isValidObjectId } = require("mongoose");

const { authenticate } = require("../../middlewares/authenticate");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  const { _id: owner } = req.user;
  const contacts = await Contact.find({ owner });
  res.json(contacts);
});

router.get("/:contactId", authenticate, async (req, res, next) => {
  const contactId = req.params.contactId;
  const { _id: owner } = req.user;
  const isValidId = isValidObjectId(contactId);
  if (!isValidId) {
    res.status(400).json({ message: `${contactId} isn't a valid id!` });
    return;
  }

  const contactById = await Contact.findOne({ _id: contactId, owner });

  if (!contactById) {
    res.status(404).json({ message: "Not Found" });
    return;
  }

  res.json(contactById);
});

router.post("/", authenticate, async (req, res, next) => {
  const body = req.body;

  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "missing fields" });
    return;
  }

  const { error } = contactBodySchema.validate(body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...body, owner });

  res.status(201).json(newContact);
});

router.delete("/:contactId", authenticate, async (req, res, next) => {
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

router.put("/:contactId", authenticate, async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const body = req.body;

  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "missing fields" });
    return;
  }

  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    res.status(400).json({ message: `${contactIdParam} isn't a valid id!` });
    return;
  }

  const { error } = contactBodySchema.validate(body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const { _id: owner } = req.user;
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactIdParam, owner },
    body,
    {
      new: true,
    }
  );
  if (!updatedContact) {
    res.status(404).json({ message: "Not Found" });
    return;
  }

  res.json(updatedContact);
});
router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const body = req.body;

  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "missing fields" });
    return;
  }

  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    res.status(400).json({ message: `${contactIdParam} isn't a valid id!` });
    return;
  }

  const { error } = favoriteBodySchema.validate(body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
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
