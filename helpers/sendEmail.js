const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENGRID_API_KEY } = process.env;

sgMail.setApiKey(SENGRID_API_KEY);

const sendMail = async (data) => {
  try {
    const mail = { ...data, from: "tsoka.anastasiya@gmail.com" };
    await sgMail.send(mail);
    return true;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendMail;
