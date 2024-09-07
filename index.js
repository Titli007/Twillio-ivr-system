require('dotenv').config();
const twilio = require("twilio");
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const webhookUrl = process.env.WEBHOOK_URL;

const app = express();
app.use(express.json())


app.post('/initiate-call', async (req, res) => {
  console.log(req.body)
  const userPhoneNumber = req.body.phone; // Expecting user's phone number in payload

  

  if (!userPhoneNumber) {
    return res.status(400).json({ error: 'User phone number is required' });
  }

  try {
    const call = await client.calls.create({
      to: userPhoneNumber,
      from: process.env.TWILLIO_PHONE_NO,  // Your Twilio phone number
      url: `${webhookUrl}/outbound`,  // Your Twilio webhook URL (handle outbound call here)
    });

    console.log(`Call initiated: ${call.sid}`);
    res.status(200).json({ message: 'Call initiated', callSid: call.sid });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});


app.use(bodyParser.urlencoded({ extended: false }));

app.post('/outbound', (request, response) => {
  console.log("Outbound call connected");
  const twiml = new VoiceResponse();

  twiml.play("https://drive.google.com/uc?export=download&id=1XwRzoSae0UHebYHIeiKvKC0Xch6dkp7O");

  const gather = twiml.gather({
    numDigits: 1,
    action: '/gather',
    method: 'POST',
  });

  twiml.say("We didn't receive any input. Goodbye.");
  twiml.hangup();

  response.type('text/xml');
  response.send(twiml.toString());
});

function getPersonalizedLink() {
  return "https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test";
}

app.post('/gather', (request, response) => {
  const twiml = new VoiceResponse();

  console.log("requests", request)

  const digits = request.body.Digits;
  const phoneNumber = request.body.To; 
  console.log(`User pressed: ${digits}`);

  if (digits === '1') {
    const personalizedLink = getPersonalizedLink();

    twiml.say(`Thank you for your interest. We're sending a personalized interview link to ${phoneNumber}`);
    
    // Send SMS with personalized link
    client.messages
      .create({
        body: `Here's your interview link: ${personalizedLink}`,
        from: process.env.TWILLIO_PHONE_NO, 
        to: process.env.USER_PHONE_NO,
      })
      .then(message => console.log(`SMS sent with SID: ${message.sid}`))
      .catch(error => console.error('Error sending SMS:', error));

  } else if (digits === '2') {
    twiml.say('You have selected option 2, that means you are not interested, thank you for your time');
    twiml.hangup();
  } else {
    twiml.say('Sorry, I did not understand that choice.');
    twiml.hangup();
  }

  response.type('text/xml');
  response.send(twiml.toString());
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Twilio IVR app listening on http://localhost:${PORT}`);
});