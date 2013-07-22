module.exports = {
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secureConnection: false,
  //name: "servername",
  auth: {
    user: "*******",
    pass: "*******"
  },
  ignoreTLS: false,
  debug: false,
  maxConnections: 5 // Default is 5
}
