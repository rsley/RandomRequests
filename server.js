const fastify = require('fastify')({ logger: true });
const axios = require('axios');
const PORT = 3000;

let nextPingTime = 0;
let service = process.env.SERVICE

function calculateNextInterval() {
    // Random interval between 5 and 20 minutes (300 to 1200 seconds)
    return Math.floor(Math.random() * (1500 - 300 + 1)) + 300;
}

function pingService() {
    axios.get(service)
        .then(response => {
            console.log("Service pinged successfully : ", service);
        })
        .catch(error => {
            console.log("Failed to ping the service.", error.message);
        });
}

function scheduleNextPing() {
    const interval = calculateNextInterval();
    nextPingTime = Date.now() + interval * 1000;
    console.log(`Next ping in ${Math.floor(interval / 60)} minutes and ${interval % 60} seconds.`);

    setTimeout(() => {
        pingService();
        scheduleNextPing();
    }, interval * 1000);
}

// Start the pinging process
scheduleNextPing();

// Fastify route to check the time until the next ping
fastify.get('/next-ping', (req, reply) => {
    const timeRemaining = nextPingTime - Date.now();
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
  
    console.log("received a request.")

    reply.send({
        minutes,
        seconds,
        service,
        message: `Next ping in ${minutes} minutes and ${seconds} seconds.`
    });
});

// Start the Fastify server
fastify.listen(PORT, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server is running on ${address}`);
});
