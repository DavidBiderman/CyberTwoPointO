const logger = require('../../logger');

const clientApi = {};

const queue = [];
const capacity = process.env.CAPACITY;
let isAtFullCapacity = false;

function sendMessage(message, level){
    
}

function isAtCapacity(){
    return isAtFullCapacity;
}

function addMessages(messages){
    queue.push(message);
    updateCapacity();
}
function updateCapacity(){
    isAtFullCapacity = queue.length >= capacity ? true : false;
}
