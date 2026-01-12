import localtunnel from 'localtunnel';
import dotenv from 'dotenv';
import colors from 'colors';
import validator from 'validator';
import { createInterface } from 'readline';



// dumb workaround to make ctrl+c nicely end the process on windows
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});
  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });

const { trim, whitelist } = validator;
dotenv.config({ path: './.env' });

//not sure why validator doesn't just use regex but this wasn't too tedious to just use a whitelist
const WHITELISTED_CHARACTERS = `abcdefghijklmnopqrstuvwxyz-`;

/**
 * Generate a timestamp in miliseconds
 * @returns {String} timestamp in miliseconds
 */
function GetTimestamp() {
    let datenow = new Date();
    return datenow.toISOString().replace("T"," ").substring(0, 19);
    //return new Date().getTime();
}

/**
 * Creates a VPN tunnel exposed to the outside network; LocalTunnel is prone to crashes, this program helps keep it online
 * @param {Number} port Integer UDP Websocket port for OBS Remote controller
 * @param {Number} delay time in miliseconds to restarts server, must be at least 1000
 * @param {String} subdomain desired prefix for OBS Blade
 * @returns {tunnel}
 */
function StartTunnel(port = 4455, delay = 100, subdomain) {

    //I wish js had type casting
    if (typeof port != 'number' ) port = Number(port);
    if (typeof subdomain != 'string' ) subdomain = String(subdomain);
    if (typeof delay != 'number' ) delay = Number(delay);
    if (delay < 100) delay = 100;

    return new Promise((resolve, reject) => {
        localtunnel({ port, subdomain })
            .then(tunnel => {
                let url = tunnel.url.split(':');
                url = `wss:${url[1]}`
                //show instructions in console once
                console.log('\nYour OBS Blade subdomain is: ');
                console.log(colors.bgWhite.black(`${url}\n`));

                //log restarts
                console.log(`${GetTimestamp()}: Local Tunnel started at ${url}:${port}`);

                //log requests, makes the program feel like its doing something
                tunnel.on('request', (info) => {
                    console.log(GetTimestamp(), info );
                })

                process.on("SIGINT", function () {
                    //graceful shutdown
                    console.log(GetTimestamp(), "Shutting down...");
                    tunnel.close();
                    return resolve(process.exit());
                });

                // localtunnel is fond of crashing for no obvious reason, 
                // this will happen often, end the promise,
                // catch the error and move on to error handling
                tunnel.on('error', (err) => {
                    tunnel.close();
                    return reject(err);
                })
            })
            .catch(err=>{
                return reject(err);
            })
    })
    .catch(err => {
        //log errors
        console.log(GetTimestamp(), colors.red(err));

        //restart the server in 100ms
        setTimeout(()=>{
            StartTunnel(port, delay, subdomain);
        }, delay) 
    })
}


function main() {
    let {PORT, SUBDOMAIN, DELAY } = process.env;

    //make sure that only valid characters are used in the subdomain with validation
    SUBDOMAIN = whitelist(trim(SUBDOMAIN),WHITELISTED_CHARACTERS);

    StartTunnel( PORT, DELAY, SUBDOMAIN );
}


main();

