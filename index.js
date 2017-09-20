const net = require('net')

class ProxyA {
  constructor(connection) {
    this.connection = connection
    this.init()
  }
  async init() {
    await this.auth()
    await this.connect()
    await this.pipe()
    this.socket.on('end', () => {
      this.connection.end()
    })
    this.connection.on('end', () => {
      this.socket.end()
    })
  }
  auth() {
    return new Promise((resolve, reject) => {
      this.connection.once('data', data => {
        if (data[0] !== 0x05) {
          console.log('error')
        } else {
          const buffer = new Buffer(2)
          buffer[0] = 0x05
          buffer[1] = 0x00
          this.connection.write(buffer)
        }
        resolve()
      })
    })
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.connection.once('data', data => {
        let host = []
        let port = 0
        switch (data[3]) {
          case 0x01:
            for (let i = 4; i <= 7; i++) {
              host.push(data[i])
            }
            port = data.readInt16BE(8)
            host = host.join('.')
            break
          case 0x03:
            host = data.toString('ascii', 5, 5 + data[4])
            port = data.readInt16BE(5 + data[4])
            break
        }
        this.socket = new net.Socket()
        this.socket.on('error', error => {
          console.log(error)
        })
        console.log(host)
        this.socket.connect(port, host, s => {
          console.log(this.socket.localAddress)
          let ips = this.socket.localAddress.split('.').map(num => {
            return Number(num)
          })
          let buffer = new Buffer([0x05, 0, 0, 0x01].concat(ips, [0, 0]))
          buffer.writeUInt16BE(this.socket.localPort, buffer.length - 2)
          console.log(buffer)
          this.connection.write(buffer)
          resolve()
        })
      })
    })
  }
  pipe() {
    return new Promise((resolve, reject) => {
      this.connection.on('data', data => {
        this.socket.write(data)
      })
      this.socket.on('data', data => {
        this.connection.write(data)
      })
      resolve()
    })
  }
}

const server = net.createServer(c => {
  console.log(`${c.remoteAddress}:${c.remotePort} connected`)
  c.on('end', () => {
    console.log(`${c.remoteAddress}:${c.remotePort} ended`)
  })
  c.on('error', error => {
    console.log(error)
  })
  const proxy = new ProxyA(c)
})

server.listen(1080, () => {
  console.log('start server')
})

const parseIpv6 = s => {
  console.log(s.split('::'))
}
