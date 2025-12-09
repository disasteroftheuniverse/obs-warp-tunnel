import localtunnel from 'localtunnel';
import dotenv from 'dotenv';
import colors from 'colors';
import validator from 'validator';
const { trim, whitelist } = validator;
dotenv.config({ path: './.env' });

//only display URL once, dirty setter just tracks if we showed the url or not
var dirty = false;

//not sure why validator doesn't just use regex but this wasn't too tedious to just use a whitelist
const WHITELISTED_CHARACTERS = `abcdefghijklmnopqrstuvwxyz-`;

/**
 * Generate a timestamp in miliseconds
 * @returns {String} timestamp in miliseconds
 */
function GetTimestamp() {
    return new Date().getTime();
}

/**
 * Creates a VPN tunnel exposed to the outside network; LocalTunnel is prone to crashes, this program helps keep it online
 * @param {Number} port Integer UDP Websocket port for OBS Remote controller
 * @param {String} subdomain desired prefix for OBS Blade
 * @param {Boolean} autorestart automatically restart the program
 * @param {Number} delay miliseconds to delay beteween restarting
 * @returns {tunnel}
 */
async function StartTunnel(port = 4455, subdomain, autorestart, delay) {
    //I wish js had type casting
    port = Number(port);
    subdomain = String(subdomain);
    autorestart = Boolean(autorestart);
    delay = Number(delay);
    return new Promise((resolve, reject) => {
        localtunnel({ port, subdomain })
            .then(tunnel => {
                let url = tunnel.url.split(':');
                url = `wss:${url[1]}`

                if (!dirty) {
                    dirty = true;
                    console.log('\nYour OBS Blade subdomain is: ');
                    console.log(colors.bgWhite.black(`${url}\n`));
                }

                //log restarts
                console.log(`${GetTimestamp()}: Local Tunnel started at ${url}:${port}`);

                //log requests, makes the program feel like its doing something
                tunnel.on('request', (info) => {
                    console.log(GetTimestamp(), info);
                })

                // localtunnel is fond of crashing for no obvious reason, 
                // this will happen often, end the promise,
                // catch the error and move on to error handling
                tunnel.on('error', (err) => {
                    return reject(err);
                })


            })
            .catch(err => {
                //log errors
                console.log(GetTimestamp(), colors.red(err))

                //this should be considered the default
                if (autorestart) {
                    if (delay > 0) {
                        console.log(GetTimestamp(), colors.yellow(`Restarting connection in ${delay}ms...`));
                        setTimeout(() => {
                            console.log(GetTimestamp(), colors.yellow("Restarting Connection!"));
                            return resolve(StartTunnel(port, subdomain, autorestart, delay));
                        }, delay);
                    }
                    else {
                        console.log(GetTimestamp(), colors.yellow("Restarting Connection!"));
                        return resolve(StartTunnel(port, subdomain, autorestart, delay));
                    }
                } else {
                    console.log(GetTimestamp(), colors.bgRed.black("Closing Connection!"));
                    return resolve(process.exit(1));
                }
            })
    })
}


function main() {
    let {PORT , AUTORESTART, SUBDOMAIN, DELAY } = process.env;
    //make sure that only valid characters are used in the subdomain
    SUBDOMAIN = whitelist(trim(SUBDOMAIN),WHITELISTED_CHARACTERS);
    //show instructions in console

    StartTunnel( PORT, SUBDOMAIN, AUTORESTART, DELAY );
}


main();
