//var pako = require('pako');

function stringToArray(bufferString) {
	let uint8Array = new TextEncoder("utf-8").encode(bufferString);
	return uint8Array;
}
function arrayToString(bufferValue) {
	return new TextDecoder("utf-8").decode(bufferValue);
}
function decompressString(compressedString){
  let compressedBytes = stringToArray(compressedString)
  let decompressedBytes = pako.inflate(compressedBytes)
  return arrayToString(decompressedBytes)
}
function compressString(decompressedString){
  let decompressedBytes = stringToArray(decompressedString)
  let compressedBytes = pako.deflate(decompressedBytes)
  return arrayToString(compressedBytes)
}


function deserialize(inputstring) {
  try {
    let decodedArray = base64js.toByteArray(inputstring)
    let decompressedArray = pako.inflate(decodedArray)
    let objectString = arrayToString(decompressedArray)
    return JSON.parse(objectString)
  }
  catch(err) {
    return {}
  }
}
function serialize(dict) {
  try {
    let inputstring = JSON.stringify(dict)
    let decompressedArray = stringToArray(inputstring)
    let compressedArray = pako.deflate(decompressedArray)
    return base64js.fromByteArray(compressedArray)
  }
  catch(err){
    return ""
  }
}


function getCardByName(cardname){
    for (let card of cards){
      if (card.name == cardname)
      {
        return card;
      }
    }
    return null;
}
function parseDeck(cardlist){
  let lines = cardlist.split("\n")
  let main = {};
  let side = {};
  let which = main;

  for (let line of lines){
    let trimmed = line.trim()
    if (line != "")
    {
      let components = line.trim().split(" ")
      let count = components.splice(0, 1)
      let cardname = (components.join(" ")).split('(')[0].trim()
      let card = getCardByName(cardname)
      if (card)
      {
        if (!(cardname in which))
        {
          which[cardname] = 0
        }
        which[cardname] += Number(count)
      }
    }
    else
    {
      which = side;
    }
  }
  return {"deck": {"main": main, "side": side}}
}
function parseDraft(cardlist){
  let lines = cardlist.split("\n")
  let picks = []
  let pack = []
  let pick = null
  let waiting = true
  for (let line of lines){
    if (line.startsWith('Pack'))
    {
        if (!waiting){
        picks.push({'pick': pick, 'pack': pack})
        }
        pick = null
        pack = []
        waiting = false
    }
    if (!waiting)
    {
       let cardname = line.trim()
       let card = null
       if (line.startsWith('-->'))
       {
         let components = line.trim().split(" ")
         let count = components.splice(0, 1)
         cardname = (components.join(" ")).split('(')[0].trim()
         card = getCardByName(cardname)
       }
       if (line.startsWith('   '))
       {
         card = getCardByName(cardname)
       }
       if (card)
       {
         pack.push(cardname)
         if (line.startsWith('-->')) {
           pick = cardname
         }
       }
    }
  }
  picks.push({'pick': pick, 'pack': pack})
  return {'draft': picks}
}
