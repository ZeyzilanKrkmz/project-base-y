const express = require("express");
const dns = require("dns");
const net = require("net");

const app = express();

app.get("/check", async (req, res) => {
    const host = req.query.host || "api.example.com";
    const port = Number(req.query.port) || 443;

    // DNS çözümü için 3 saniyelik timeout
    const dnsPromise = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("DNS Timeout")), 3000);
        dns.lookup(host, { all: true }, (err, addresses) => {
            clearTimeout(timer);
            if (err) return reject(err);
            resolve(addresses.map(a => a.address));
        });
    });

    try {
        const ips = await dnsPromise;
        if (!ips.length) throw new Error("No IP found for host");

        // TCP bağlantısı için 3 saniyelik timeout
        const start = Date.now();
        await new Promise((resolve, reject) => {
            const socket = net.connect(port, ips[0]);
            socket.setTimeout(3000);
            socket.on("connect", () => { socket.destroy(); resolve(); });
            socket.on("timeout", () => { socket.destroy(); reject(new Error("TCP Timeout")); });
            socket.on("error", (err) => { socket.destroy(); reject(err); });
        });

        res.json({ host, ips, port, reachable: true, time_ms: Date.now() - start });

    } catch (err) {
        res.json({ host, port, reachable: false, error: err.message });
    }
});

app.listen(3001, () => console.log("Check server running on http://127.0.0.1:3001"));
