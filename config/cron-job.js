import cron from "node-cron";
import Cart from "../src/models/adminModel/CartModel.js";
import transporter from "../config/emailConfig.js";
import User from "../src/models/adminModel/AdminModel.js";

async function logMessage() {



      try {
        let info = await transporter.sendMail({
          from: 'mail@dilamsys.com', // sender address
          to: 'st4272333@gmail.com', // list of receivers
          subject: "Complete Your Purchase - Your Abandoned Cart Details", // Subject line
          html: `hello test mail` });
      } catch (error) {
       error.message ;
      }
    


  console.log("Cron job executed at:", new Date().toLocaleString());
}

// Schedule the cron job to run every minute
cron.schedule("* * * * *", () => {
  
  logMessage();
});
