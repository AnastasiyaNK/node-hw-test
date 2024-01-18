const express = require("express");
const { isValidObjectId } = require("mongoose");

const {
  contactBodySchema,
  Contact,
  favoriteBodySchema,
} = require("../../models/contacts");
const { httpError } = require("../../helpers");
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
    throw httpError(400, `${contactId} isn't a valid id!`);
  }

  const contactById = await Contact.findOne({ _id: contactId, owner });

  if (!contactById) {
    throw httpError(404, "Not Found");
  }

  res.json(contactById);
});

router.post("/", authenticate, async (req, res, next) => {
  const body = req.body;

  if (Object.keys(req.body).length === 0) {
    throw httpError(400, "missing fields");
  }

  const { error } = contactBodySchema.validate(body);
  if (error) {
    throw httpError(400, error.details[0].message);
  }
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...body, owner });

  res.status(201).json(newContact);
});

router.delete("/:contactId", authenticate, async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const { _id: owner } = req.user;
  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    throw httpError(400, `${contactIdParam} isn't a valid id!`);
  }
  const removedContact = await Contact.findOneAndDelete({
    _id: contactIdParam,
    owner,
  });

  if (!removedContact) {
    throw httpError(404, "Not Found");
  }
  res.status(200).json({ message: "contact deleted" });
});

router.put("/:contactId", authenticate, async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const body = req.body;

  if (Object.keys(req.body).length === 0) {
    throw httpError(400, "missing fields");
  }

  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    throw httpError(400, `${contactIdParam} isn't a valid id!`);
  }

  const { error } = contactBodySchema.validate(body);
  if (error) {
    throw httpError(400, error.details[0].message);
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
    throw httpError(404, "Not Found");
  }

  res.json(updatedContact);
});
router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  const contactIdParam = req.params.contactId;
  const body = req.body;
  const { _id: owner } = req.user;

  if (Object.keys(req.body).length === 0) {
    throw httpError(400, "missing fields");
  }

  const isValidId = isValidObjectId(contactIdParam);
  if (!isValidId) {
    throw httpError(400, `${contactIdParam} isn't a valid id!`);
  }

  const { error } = favoriteBodySchema.validate(body);
  if (error) {
    throw httpError(400, error.details[0].message);
  }
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactIdParam, owner },
    body,
    {
      new: true,
    }
  );

  if (!updatedContact) {
    throw httpError(404, "Not Found");
  }

  res.json(updatedContact);
});

module.exports = router;
