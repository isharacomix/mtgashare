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
  cardname = cardname.toLowerCase()
    for (let card of cards){
      if (card.name.toLowerCase() == cardname || (card.name.split('/')[0].trim().toLowerCase() == cardname)  )
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
        if (!(card.name in which))
        {
          which[card.name] = 0
        }
        which[card.name] += Number(count)
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
         pack.push(card.name)
         if (line.startsWith('-->')) {
           pick = card.name
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
      if (card.type_line.includes("Planeswalker"))
      {
        families.Planeswalker.push(cardname)
      }
      else if (card.type_line.includes("Creature"))
      {
        families.Creature.push(cardname)
      }
      else if (card.type_line.includes("Enchantment"))
      {
        families.Enchantment.push(cardname)
      }
      else if (card.type_line.includes("Land"))
      {
        families.Land.push(cardname)
      }
      else if (card.type_line.includes("Artifact"))
      {
        families.Artifact.push(cardname)
      }
      else if (card.type_line.includes("Instant"))
      {
        families.Instant.push(cardname)
      }
      else if (card.type_line.includes("Sorcery"))
      {
        families.Sorcery.push(cardname)
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
   let card1 = getCardByName(a)
   let card2 = getCardByName(b)

   let ac = card1.color_identity.join() + " "+ card1.name
   let bc = card2.color_identity.join() + " "+ card2.name

   if (card1.type_line.includes("Basic")) {ac = "zzz"+ac}
   if (card2.type_line.includes("Basic")) {bc = "zzz"+bc}

   return desc ? ~~(ac > bc) : ~~(ac < bc);
  }
}


function deckHTML(cards)
{
  let deckdata = sortCardsByType(cards.main, cards.side)


  let output = ""
  output += "<div class='card-columns'>"
  for (let family of ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Land", "Other", "Sideboard"])
  {
    if (family in deckdata && deckdata[family].length > 0)
    {
        output += "<div class='card'  style='border: none;'><div class='card-body'>"
        output += "<div><h3>"+family+"</h3></div>"

        output += "<div>"
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
          output += "<div>"+count+" "+card+"</div>"
        }
        output += "</div>"


        output += "</div></div>"
    }
  }
  output += "</div>"
  return output
}


function mtgColumns(cards, marginpx)
{
  let output = "<div class=' mb-5 mt-5'>"
  let colheight = Math.floor(cards.length / 5)
  let coloffset = cards.length % 5
  let colheights = [colheight, colheight, colheight, colheight, colheight]
  if (coloffset > 3)
  {
    colheights[3] += 1
  }
  if (coloffset > 2)
  {
    colheights[2] += 1
  }
  if (coloffset > 1)
  {
    colheights[1] += 1
  }
  if (coloffset > 0)
  {
    colheights[0] += 1
  }

  for (let i = 0; i < colheights[0]; i++)
  {
    for (let j = 0; j < 5; j++)
    {
      let index = i
      if (j > 3) { index += colheights[3]  }
      if (j > 2) { index += colheights[2]  }
      if (j > 1) { index += colheights[1]  }
      if (j > 0) { index += colheights[0]  }

      let uri = "img/fakecard.png"
      let link = null
      if (i < colheights[j])
      {
        let cardobj = getCardByName(cards[index])
        if ("image_uris" in cardobj)
        {
          uri = cardobj.image_uris.normal
          link = cardobj.scryfall_uri
        }
        else if ("card_faces" in cardobj && "image_uris" in cardobj.card_faces[0])
        {
          uri = cardobj.card_faces[0].image_uris.normal
          link = cardobj.scryfall_uri
        }
      }
        let margin = "margin-bottom: -"+marginpx+"px;"
        if (i == colheights[0]-1)
        {
          margin = ""
        }
        if (link) {output += "<a href='"+link+"'>"}
        output += "<img src='"+uri+"' style='width: 20%; "+margin+"'>"
        if (link) {output += "</a>"}

    }
  }
  output += "</div>"


  return output
}

function visualHTML(cards)
{
  let deckdata = sortCardsByType(cards.main, cards.side)

  let mainboard = []
  let sideboard = []
  for (let family of ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Land", "Other"])
  {


    for (let card of deckdata[family])
    {
      let count = cards.main[card]
      while (count > 0)
      {
        count -= 1
        mainboard.push(card)
      }
    }
  }
  for (let family of ["Sideboard"])
  {
    for (let card of deckdata[family])
    {
      let count = cards.side[card]
      while (count > 0)
      {
        count -= 1
        sideboard.push(card)
      }
    }
  }

  let output = ""
  output += mtgColumns(mainboard, 240)
  output += mtgColumns(sideboard, 240)
  return output

}


function textualDraftHTML(draft)
{
  let output = ""
  let packno = 0
  let pickno = 0
  let last = 0
  for (let pick of localmedia.draft)
  {
    let entry = ""
    if (pick.pack.length > last)
    {
      packno += 1
      pickno = 0
    }
    pickno += 1
    last = pick.pack.length
    entry += "<div class='card mb-5 mt-5 d-xl-none'>"
    entry += "<div class='card-header'>Pack "+packno+", Pick "+pickno+"</div>"
    entry += "<div class='card-body>'"
    entry += "<div class='container'>"

    entry += "<div class='row'>"
    entry += "<div class='col-5 offset-1'>"
    entry += "<div class='mb-5 mt-5'>"
    entry += "<em><strong>"+pick.pick+"</strong></em>"
    entry += "</div>"
    entry += "</div>"

    entry += "<div class='col-5'>"
    entry += "<div class='mb-5 mt-5'>"

    let index = pick.pack.indexOf(pick.pick);
    if (index > -1) {
      pick.pack.splice(index, 1);
    }
    for (let c in pick.pack)
    {
      entry += "<div>" + pick.pack[c]
      entry += "</div>"
    }
    entry += "</div>"
    entry += "</div>"


    entry += "</div>"

    entry += "</div>"
    entry += "</div>"
    entry += "</div>"

    output += entry
  }
  return output
}

function visualDraftHTML(draft)
{
  let output = ""

  let packno = 0
  let pickno = 0
  let last = 0
  for (let pick of localmedia.draft)
  {
    let entry = ""
    if (pick.pack.length > last)
    {
      packno += 1
      pickno = 0
    }
    pickno += 1
    last = pick.pack.length
    entry += "<div class='card mb-5 mt-5 d-none d-xl-block'>"
    entry += "<div class='card-header'>Pack "+packno+", Pick "+pickno+"</div>"
    entry += "<div class='card-body>'"
    entry += "<div class='container'>"

    entry += "<div class='row'>"
    entry += "<div class='col-2 offset-1'>"
    entry += "<div class='mb-5 mt-5'>"

      let uri = "img/fakecard.png"
      let link = null
        let cardobj = getCardByName(pick.pick)
        if ("image_uris" in cardobj)
        {
          uri = cardobj.image_uris.normal
          link = cardobj.scryfall_uri
        }
        else if ("card_faces" in cardobj && "image_uris" in cardobj.card_faces[0])
        {
          uri = cardobj.card_faces[0].image_uris.normal
          link = cardobj.scryfall_uri
        }
        if (link) {entry += "<a href='"+link+"'>"}
        entry += "<img src='"+uri+"' style='width: 100%;'>"
        if (link) {entry += "</a>"}
    entry += "</div>"
    entry += "</div>"

    entry += "<div class='col-8'>"
    let index = pick.pack.indexOf(pick.pick);
    if (index > -1) {
      pick.pack.splice(index, 1);
    }
      entry += mtgColumns(pick.pack, 180)
    entry += "</div>"


    entry += "</div>"

    entry += "</div>"
    entry += "</div>"
    entry += "</div>"

    output += entry
  }


  return output
}
