const Joi = require("joi");

const { model, Schema } = require("mongoose");

const contactBodySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const favoriteBodySchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const contactsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = model("contact", contactsSchema);

module.exports = {
  Contact,
  contactBodySchema,
  favoriteBodySchema,
};
