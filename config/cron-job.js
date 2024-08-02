import cron from "node-cron";
import Cart from "../src/models/adminModel/CartModel.js";
import transporter from "../config/emailConfig.js";
import twilio from "twilio";
import User from "../src/models/adminModel/AdminModel.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function sendSms(to, body) {
  try {
    await client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log("SMS sent successfully");
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

async function logMessage(time) {
  var carts;
  if (time == 15) {
    carts = await Cart.find({
      fifteen_min: false,
    }).exec();
  } else if (time == 4) {
    carts = await Cart.find({
      four_hour: false,
    }).exec();
  } else if (time == 16) {
    carts = await Cart.find({
      sixteen_hour: false,
    }).exec();
  } else {
    carts = await Cart.find({
      twenty_four_hour: false,
    }).exec();
  }

  for (const cart of carts) {
    const user = await User.findOne({ id: cart.user_id }).exec();
    if (user) {
      const userPhoneNumber = user.phone_number;
      const userEmail = user.email;
      const messageBody = `Hey, it looks like you left some items in your cart ${time} ago. Come back and complete your purchase!`;

      try {
    
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM, // sender address
          to: userEmail, // list of receivers
          subject: "Reminder: Items in Your Cart", // Subject line
          html:  messageBody, // html body
        });
      } catch (e) {
        // return handleResponse(400, e.message, {}, res);
      }

      // await sendSms(userPhoneNumber, messageBody);

      if (time == 15) {
        cart.fifteen_min = true;
      } else if (time == 4) {
        cart.four_hour = true;
      } else if (time == 16) {
        cart.sixteen_hour = true;
      } else {
        cart.twenty_four_hour = true;
      }

      await cart.save();
    }
  }

  console.log("Cron job executed at:", new Date().toLocaleString());
}

// Schedule the cron job to run every minute

var Job = () => {
  // Schedule for 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    var time = 15;
    console.log("Checking for carts abandoned for 15 minutes...");
    await logMessage(time);
  });

  // Schedule for 4 hours
  cron.schedule("0 */4 * * *", async () => {
    var time = 4;
    console.log("Checking for carts abandoned for 4 hours...");
    await logMessage(time);
  });

  // Schedule for 16 hours
  cron.schedule("0 */16 * * *", async () => {
    var time = 16;
    console.log("Checking for carts abandoned for 16 hours...");
    await logMessage(time);
  });

  // Schedule for 24 hours
  cron.schedule("0 0 * * *", async () => {
    var time = 24;
    console.log("Checking for carts abandoned for 24 hours...");
    await logMessage(time);
  });
};

export default Job;
