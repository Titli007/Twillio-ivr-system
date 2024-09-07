
# Twilio IVR System with SMS for Personalized Interview Links

This is a simple Interactive Voice Response (IVR) system built using Twilio's API and Node.js. It initiates a phone call to a specified number, plays a pre-recorded audio file, gathers user input, and sends an SMS with a personalized interview link when the user selects the sales option.

## Features
- Initiates an outbound call using the Twilio API.
- Plays a pre-recorded audio message during the call.
- Gathers user input via keypresses (DTMF).
- If the user presses '1, they receive a personalized interview link via SMS.
- If the user presses '2', the call ends with a polite message.
- If no input is received, the call is automatically terminated.
- Sends personalized links via SMS when user selects the option.

## Prerequisites
To run this project, you'll need:
- **Node.js** installed.
- A **Twilio** account with a **Twilio phone number**.
- An **ngrok** account (if testing locally) to expose your local server to the web.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Titli007/Twillio-ivr-system.git
cd twilio-ivr-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root of your project with the following contents:
```bash
TWILLIO_ACCOUNT_SID=your_twilio_account_sid
TWILLIO_AUTH_TOKEN=your_twilio_auth_token
TWILLIO_PHONE_NO=your_twilio_phone_number
USER_PHONE_NO=your_phone_number_to_receive_call
WEBHOOK_URL=your_ngrok_or_hosted_url
PORT=3000
```

- `TWILLIO_ACCOUNT_SID`: Your Twilio account SID.
- `TWILLIO_AUTH_TOKEN`: Your Twilio auth token.
- `TWILLIO_PHONE_NO`: The Twilio phone number from which calls and SMS are sent.
- `USER_PHONE_NO`: The user's phone number to which the call and SMS will be sent.
- `WEBHOOK_URL`: Your ngrok or hosted URL where Twilio will send webhook requests.
- `PORT`: The port on which your Express server will run (default is 3000).

### 4. Start ngrok (If running locally)
Use ngrok to expose your local server to the web:
```bash
ngrok http 3000
```
Copy the generated ngrok URL and update the `WEBHOOK_URL` in your `.env` file.

### 5. Run the Server
Start the Node.js server:
```bash
node your-server-file.js
```

### 6. Configure Twilio Webhook
- Go to the [Twilio Console](https://www.twilio.com/console).
- Under **Phone Numbers**, select your Twilio number.
- In the **Voice & Fax** section, under **A Call Comes In**, set the webhook URL to:
  ```
  https://<your-ngrok-url>/outbound
  ```
- Choose the **HTTP POST** method.

### 7. Testing
Once the server is running and ngrok is set up, a call will be initiated automatically to the number specified in the `.env` file (`USER_PHONE_NO`). You can interact with the IVR system:
- Press `1` to receive a personalized interview link via SMS.
- Press `2` to terminate the call with a polite message.

## How It Works

1. **Outbound Call**: 
   When the server starts, an outbound call is initiated using the Twilio API to the user's phone number (`USER_PHONE_NO`). The call plays a pre-recorded audio file hosted on Google Drive.

2. **Gather User Input**:
   During the call, the user is prompted to press `1` for sales or `2` for support.

3. **Send Personalized Interview Link via SMS**:
   - If the user presses `1`, a personalized interview link is sent via SMS to the phone number specified in the `.env` file (`USER_PHONE_NO`).
   - The link is personalized using the function `getPersonalizedLink()`.

4. **Handle User Input**:
   - If the user presses `2`, a polite message is played, and the call is terminated.
   - If the user presses any other key or no key at all, a message is played, and the call is terminated.

## Example Code
Here’s a snippet of the critical sections:

### Outbound Call
```javascript
async function createCall() {
  try {
    const call = await client.calls.create({
      to: process.env.USER_PHONE_NO,
      from: process.env.TWILLIO_PHONE_NO,
      url: `${webhookUrl}/outbound`,
    });
    console.log(`Call initiated: ${call.sid}`);
  } catch (error) {
    console.error('Error initiating call:', error);
  }
}
```

### Gather and Respond to User Input
```javascript
app.post('/gather', (request, response) => {
  const twiml = new VoiceResponse();
  const digits = request.body.Digits;
  console.log(`User pressed: ${digits}`);

  if (digits === '1') {
    const personalizedLink = getPersonalizedLink();
    twiml.say('Thank you for your interest. We will send a personalized link.');
    
    client.messages
      .create({
        body: `Here's your personalized interview link: ${personalizedLink}`,
        from: process.env.TWILLIO_PHONE_NO,
        to: process.env.USER_PHONE_NO,
      })
      .then(message => console.log(`SMS sent with SID: ${message.sid}`))
      .catch(error => console.error('Error sending SMS:', error));
  } else if (digits === '2') {
    twiml.say('You have selected option 2, thank you for your time.');
  }

  response.type('text/xml');
  response.send(twiml.toString());
});
```

## License
This project is licensed under the MIT License. Feel free to use it as you see fit!
