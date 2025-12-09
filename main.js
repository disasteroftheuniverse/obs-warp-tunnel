import localtunnel from 'localtunnel';
import dotenv from 'dotenv';

/**
 * Creates a VPN tunnel exposed to the outside network; LocalTunnel is prone to crashes, this program helps keep it online
 * @param {Number} port Integer UDP Websocket port for OBS Remote controller
 * @param {String} subdomain desired prefix for OBS Blade
 * @param {Boolean} autorestart automatically restart the program
 * @param {Number} delay miliseconds to delay beteween restarting
 * @returns {tunnel}
 */
async function StartTunnel(port=4455, subdomain, autorestart, delay) {
    return new Promise((resolve,reject)=>{
        localtunnel({ port, subdomain })
        .then(tunnel=>{
            console.log(`${Date.now}: Local Tunnel started at ${tunnel.url}:${port}`);

            tunnel.on('request',(info)=>{
                var msg = JSON.stringify(info);
                console.log(`${Date.now}: ${msg}`);
            })

            tunnel.on('error',(err)=>{
                return reject(err);
            })
        })
        .catch(err=>{
            var msg = JSON.stringify(err);
            console.log(`${Date.now}: ${msg}`);
            return resolve(StartTunnel(port, subdomain))
        })
    })
}