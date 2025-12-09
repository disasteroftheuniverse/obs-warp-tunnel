import localtunnel from 'localtunnel';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

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
                //log restarts
                console.log(`${GetTimestamp()}: Local Tunnel started at ${tunnel.url}:${port}`);

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
                console.log(GetTimestamp(), err)

                //this should be considered the default
                if (autorestart) {
                    if (delay) {
                        setTimeout(() => {
                            return resolve(StartTunnel(port, subdomain, autorestart, delay));
                        }, delay);
                    }
                    else {
                        return resolve(StartTunnel(port, subdomain, autorestart, delay));
                    }
                } else {
                    return resolve(process.exit(1));
                }
            })
    })
}


function main() {
    let {PORT , AUTORESTART, SUBDOMAIN, DELAY } = process.env;
    StartTunnel( PORT, SUBDOMAIN, AUTORESTART, DELAY );
}


main();
