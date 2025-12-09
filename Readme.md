<pre>
  ____  ___  ____  _      _____   ___  ___    ________  ___  ___  ________ 
 / __ \/ _ )/ __/ | | /| / / _ | / _ \/ _ \  /_  __/ / / / |/ / |/ / __/ / 
/ /_/ / _  |\ \   | |/ |/ / __ |/ , _/ ___/   / / / /_/ /    /    / _// /__
\____/____/___/   |__/|__/_/ |_/_/|_/_/      /_/  \____/_/|_/_/|_/___/____/
                                                                           
</pre> 
# OBS Warp Tunnel   

A simple wrapper for localtunnel that keeps it running. Intended to be with OBS Blade so OBS can be manipulated remotely. Local tunnel is unstable and likes to crash, this script maintains uptime, and keeps the subdomain, as losing a subdomain can be very inconvenient if it is lost while using OBS Blade in a remote location. Ideal for IRL streamers. Future versions will use electron for a simple user interface.

## Installation

```
> git clone https://github.com/disasteroftheuniverse/obs-warp-tunnel.git
& cd obs-warp-tunnel 
& npm install
```

## Usage

In OBS, go to `Tools > Websocket Server Settings` to get or set the websocket server port. Also set a websocket server password.  

![img](wss.png)

Edit the included .ENV file to set the `PORT` key to match the corresponding port in OBS and set the `SUBDOMAIN` key to the desired subdomain. 

```
PORT=7000
SUBDOMAIN=SPACETACO
```

Run the included batch file, launch.bat. The console will display address you will need to connect to in OBS Blade.

In OBS Blade, set the host and password, but leave the port blank:

![img](blade.png)

You will now have the ability to remotely control your OBS from your iOS device.



