require('dotenv').config();
module.exports = {
    listenIp: '0.0.0.0',
    listenPort: 3000,
    // sslCrt: '/etc/ssl/certs/ssl-cert-snakeoil.pem',
    // sslKey: '/etc/ssl/private/ssl-cert-snakeoil.key',
    mediasoup: {
      // Worker settings
      worker: {
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
        logLevel: 'warn',
        logTags: [
          'info',
          'ice',
          'dtls',
          'rtp',
          'srtp',
          'rtcp',
          // 'rtx',
          // 'bwe',
          // 'score',
          // 'simulcast',
          // 'svc'
        ],
      },
      // Router settings
      router: {
        mediaCodecs:
          [
            {
              kind: 'audio',
              mimeType: 'audio/opus',
              clockRate: 48000,
              channels: 2
            },
            {
              kind: 'video',
              mimeType: 'video/VP8',
              clockRate: 90000,
              parameters:
                {
                  'x-google-start-bitrate': 1000
                }
            },
            {
              kind: "video",
              mimeType: "video/h264",
              clockRate: 90000,
              parameters: {
                "packetization-mode": 1,
                "profile-level-id": "4d0032",
                "level-asymmetry-allowed": 1,
                //						  'x-google-start-bitrate'  : 1000
              },
            },
            {
              kind: "video",
              mimeType: "video/h264",
              clockRate: 90000,
              parameters: {
                "packetization-mode": 1,
                "profile-level-id": "42e01f",
                "level-asymmetry-allowed": 1,
                //						  'x-google-start-bitrate'  : 1000
              },
            },
          ]
      },
      // WebRtcTransport settings
      webRtcTransport: {
        listenIps: [
          {
            // ip: '127.0.0.1', //��?���� ip????? server?? 
            // announcedIp: '127.0.0.1',
            ip: process.env.CONFIG_IP, 
            announcedIp: process.env.CONFIG_ANNOUNCE_IP,
          }
        ],
        maxIncomingBitrate: 1500000,
        initialAvailableOutgoingBitrate: 1000000,
      }
    }
  };
  
