const net = require('net')
let port = process.argv.length >= 3 ? process.argv[2].split('=')[1] : '1086'

function Socks5Client() {
  this.socket = new net.Socket()
  this.init()
}

Socks5Client.prototype.init = async function() {
  await this.tcp()
  await this.auth()
  await this.connet()
  console.log(this.socket.localPort)
  this.get()
}

Socks5Client.prototype.tcp = function() {
  return new Promise((resolve, reject) => {
    this.socket.connect(port, '127.0.0.1', () => {
      resolve()
    })
  })
}

Socks5Client.prototype.auth = function() {
  return new Promise((resolve, reject) => {
    const buffer = new Buffer(3)
    buffer[0] = 0x05
    buffer[1] = 1
    buffer[2] = 0x00
    this.socket.write(buffer)
    this.socket.once('data', data => {
      resolve()
    })
  })
}

Socks5Client.prototype.connet = function() {
  return new Promise((resolve, reject) => {
    const req = [0x05, 0x01, 0x00, 0x01]
    let host = '216.58.217.206'
    host = '111.13.101.208'
    host = '166.111.4.98'
    host.split('.').map(item => {
      req.push(parseInt(item))
    })
    req.length += 2
    const buffer = new Buffer(req)
    buffer.writeUInt16BE(80, buffer.length - 2)
    this.socket.write(buffer)
    this.socket.once('data', data => {
      console.log(data)
      resolve()
    })
  })
}

Socks5Client.prototype.get = function() {
  this.socket.on('data', data => {
    console.log(data.toString('ascii'))
  })
  // http://net.tsinghua.edu.cn/wired/succeed.html?online
  const buffer = new Buffer('GET / HTTP/1.1\r\n\r\n')
  this.socket.write(buffer)
}

const client = new Socks5Client()
