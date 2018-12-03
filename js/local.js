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
    let padding = 4-(inputstring.length)%4
    let pads = ""
    if (padding == 1) {
      pads = "="
    }
    if (padding == 2) {
      pads = "=="
    }
    if (padding == 3) {
      pads = "==="
    }
    let decodedArray = base64js.toByteArray(inputstring+pads)
    let decompressedArray = pako.inflate(decodedArray)
    let objectString = arrayToString(decompressedArray)
    return JSON.parse(objectString)
  }
  catch(err) {
    console.log(err)
    return {}
  }
}
function serialize(dict) {
  try {
    let inputstring = JSON.stringify(dict)
    let decompressedArray = stringToArray(inputstring)
    let compressedArray = pako.deflate(decompressedArray)
    let padded = base64js.fromByteArray(compressedArray)
    return padded.split('=')[0]
  }
  catch(err){
    console.log(err)
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

function sortCardsByType(cardlist, sideboard)
{
    families = {}
    families['Artifact'] = []
    families['Creature'] = []
    families['Instant'] = []
    families['Sorcery'] = []
    families['Enchantment'] = []
    families['Planeswalker'] = []
    families['Land'] = []
    families['Other'] = []
    families['Sideboard'] = []

    for (let cardname of Object.keys(cardlist))
    {
      card = getCardByName(cardname)
      if (card.type_line.includes("Creature"))
      {
        families.Creature.push(cardname)
      }
      else if (card.type_line.includes("Land"))
      {
        families.Land.push(cardname)
      }
      else if (card.type_line.includes("Artifact"))
      {
        families.Artifact.push(cardname)
      }
      else if (card.type_line.includes("Enchantment"))
      {
        families.Enchantment.push(cardname)
      }
      else if (card.type_line.includes("Instant"))
      {
        families.Instant.push(cardname)
      }
      else if (card.type_line.includes("Sorcery"))
      {
        families.Sorcery.push(cardname)
      }
      else if (card.type_line.includes("Planeswalker"))
      {
        families.Planeswalker.push(cardname)
      }
      else
      {
        families.Other.push(cardname)
      }
    }
    for (let cardname of Object.keys(sideboard))
    {
      families.Sideboard.push(cardname)
    }
    for (let family of Object.keys(families))
    {
      families[family].sort(cardsort('color'))
    }
    return families
}

function cardsort(desc) {
  return function(a,b){
   ac = getCardByName(a).color_identity.join() + " "+ a
   bc = getCardByName(b).color_identity.join() + " "+ b
   return desc ? ~~(ac > bc) : ~~(ac < bc);
  }
}


function deckHTML(cards)
{
  let deckdata = sortCardsByType(cards.main, cards.side)


  let output = ""
  output += "<div>"
  for (let family of ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Land", "Other", "Sideboard"])
  {
    if (family in deckdata && deckdata[family].length > 0)
    {
        output += "<div>"
        output += "<div><h3>"+family+"</h3></div>"

        output += "<div><ul>"
        for (let card of deckdata[family])
        {
          let count = 0
          if (family == "Sideboard")
          {
            count = cards.side[card]
          }
          else {
            count = cards.main[card]
          }
          output += "<li>"+count+" "+card+"</li>"
        }
        output += "</ul></div>"


        output += "</div>"
    }
  }
  output += "</div>"
  return output
}
