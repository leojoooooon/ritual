# mobile-machine-sockets

This is a web-sockets with socket.io multi-user mobile phone starter template. The server just streams data, no state is tracked in the server. 

The live example can be seen on Render: https://mobile-machine-sockets.onrender.com/

## To test locally:
Once you have downloaded or cloned the repo. In VS Code open the terminal, make sure you are in the root directory (you can run the command pwd to double check).

Run `npm install`

Run `node app.js` to start the server

You will then need to go to http://localhost:4444/ in your browser window(s) to test functionality locally on your machine. Optionally, specify a port by supplying the port variable in app.js. process.env.PORT variable will be used instead when available (e.g. on Render.com).

__HOWEVER__ this cannot be tested over a local network that doesn't have secure protocols in place, __you must push changes to Render to test on phones__ (or have some other way of securely serving your site to mobile phones). 

Mobile device orientation and acceleration permissions will not work on sites that are not secure (e.g. using https).