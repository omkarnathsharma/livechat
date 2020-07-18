        let Peer = require('simple-peer')
        const io = require('socket.io-client')
        let socket = io();
          let client={}
          let video=document.getElementById("myVid")
          let video2=document.getElementById("myVid2")
          navigator.mediaDevices.getUserMedia({video:true, audio:true}).then((strem)=> {
            video.srcObject=strem
            video.play()
            socket.emit('newClient')

            function initPeer(type){
              let peer = new Peer({initiator: (type == 'init')?true:false, stream:strem, trickle:false})
              peer.on('stream', function(stream) {
                video2.srcObject=stream
                video2.play()
              })
              return peer
            }


            socket.on('backOffer', function(offer){
              console.log(offer)
              let peer = initPeer('not init')
              peer.on('signal', function(data){
                socket.emit('answer', data)
              })
              peer.signal(offer)
            })
            socket.on('backAnswer', function(answer){
              client.gotAnswer=true
              let peer=client.peer
              peer.signal(answer)
            })
            socket.on('createPeer', function(){
              console.log('making')
              client.gotAnswer=false
              let peer = initPeer('init')
              peer.on('signal', function(data){
                if(!client.gotAnswer){
                  socket.emit('offer',data)
                }
              })
              client.peer=peer

            })

            // socket.on('stream', function(stream){
            // video.srcObject=stream
            // video.play() 
            // video.stop()
            // })
          })