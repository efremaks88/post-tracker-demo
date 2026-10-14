/**
 * ПОСТ ТРЕКЕР — SSE модуль
 *
 * Server-Sent Events для real-time рассылки изменений клиентам
 */
module.exports = function createSSE() {
  var sseClients = new Set();

  var keepaliveTimer = null;

  function broadcast(event) {
    var msg = "data: " + JSON.stringify(event) + "\n\n";
    for (var client of sseClients) {
      try { client.write(msg); } catch (e) { sseClients.delete(client); }
    }
  }

  function startKeepalive() {
    if (keepaliveTimer) clearInterval(keepaliveTimer);
    keepaliveTimer = setInterval(function() {
      for (var client of sseClients) {
        try { client.write(": keepalive\n\n"); } catch (e) { sseClients.delete(client); }
      }
    }, 25000);
  }

  function handleSSE(req, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(": connected\n\n");
    sseClients.add(res);
    req.on("close", function() { sseClients.delete(res); });
  }

  return {
    sseClients: sseClients,
    broadcast: broadcast,
    startKeepalive: startKeepalive,
    handleSSE: handleSSE,
  };
};
