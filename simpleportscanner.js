const filterService = require('./filteringService');


(async function test() {
  try {
    const sources = [
      '127.0.0.11',
      '127.0.0.21',
      '127.0.0.72',
      '127.0.0.51',
      '127.0.0.61',
      '127.0.0.2',
      '127.0.0.32',
      '127.0.0.12',
      '127.0.0.91',
      '127.0.0.131'
    ];
    const dests = [
      '122.47.22.35',
      '122.47.22.31',
      '122.47.22.22',
      '122.47.22.75',
      '122.47.22.57',
      '122.47.22.83',
      '122.47.22.76',
      '122.47.22.76',
      '122.47.22.69',
      '122.47.22.39'
    ];

    const ports = [];

    for(let i=0; i<10; i++){
      ports.push(Math.floor(Math.random() * 200) + 1);
    }

    for(let i=0; i<200; i++){
      
      const numberOfRequests =  Math.floor(Math.random() * 100) + 1;
      const source = sources[Math.floor(Math.random() * 10)];
      
      for(let j=0;j<numberOfRequests;j++){
        const port = ports[Math.floor(Math.random() * 10)];
        const dest = dests[Math.floor(Math.random() * 10)];
        const payload = Math.random().toString(36).substring(7);
        if(Math.round(Math.random()*3)>1){
          //Adding random timeout intervals to sparse results, can be removed for more "port scan cases".
          console.log('awaitng timeout...');
          await new Promise((resolve,reject)=>setTimeout(()=>{resolve()},500));
          console.log(`${source} to ${dest}:${port}`);
          filterService(source, dest, port, payload);
        }else{
          console.log(`${source} to ${dest}:${port}`);
          filterService(source, dest, port, payload);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
})()