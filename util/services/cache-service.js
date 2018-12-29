const redis = require('redis');
const client = redis.createClient(process.env.REDIS);

const clientApi = {};

client.on('connect', () => { console.log("CONNECTED")});

const fetchActiveMember = (source) => {
    return new Promise((resolve, reject) =>{
        const key = convertToKey(source); 
        client.get(key, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        })
    })
    
};

const createOrUpdateActiveMember = (source, data) => {
    const stringData = JSON.stringify(data);
    const key = convertToKey(source); 
    client.set(key, stringData, (err, reply) => {
        if(err){
            console.log(err);
        } else {
            return reply;
        }
    });
}

const removeFromActiveList = (source) => {
    const key = convertToKey(source); 
    client.del(key, (err, reply) => {
        if(err){

        } else {
            return reply;
        }
    });
}

const fetchBlacklistedMember = (source) => {
    return new Promise((resolve, reject) => {
        const key = convertToKey(source); 
        client.hget(key, 'blacklisted', (err, reply) => {
            if (err) {
                //reject(err);
                resolve(false);
            } else {
                resolve(!!reply); // return as a boolean
            }
        })
    })
}

const addBlacklistedMember = (source) => {
    const key = convertToKey(source); 
    client.hset(key, 'blacklisted', 'true', (err, reply) => {
        if(err){

        } else {
            return reply;
        }
    })
}

const convertToKey = (source) => {
    return source.replace(/\./g, '-');
}

clientApi.createOrUpdateActiveMember = createOrUpdateActiveMember;
clientApi.fetchActiveMember = fetchActiveMember;
clientApi.addBlacklistedMember = addBlacklistedMember;
clientApi.fetchBlacklistedMember = fetchBlacklistedMember;
clientApi.removeFromActiveList = removeFromActiveList;

module.exports = clientApi;