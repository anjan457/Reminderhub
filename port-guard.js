(function () {
  var host = location.hostname;
  var port = location.port;
  if ((host === 'localhost' || host === '127.0.0.1') && port === '3001') {
    location.replace('http://' + host + ':3000' + location.pathname + location.search + location.hash);
  }
})();
