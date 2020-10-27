#!/usr/bin/env python3
# -*- coding: utf-8 -*-



import os, sys
import json, wget
import requests







def update():
    oldcardlist = []
    try:
        oldcardlist = json.loads(open('cardlist.json').read())
    except:
        pass
    cardlist = requests.get('https://api.scryfall.com/cards/search?q=c>%3Dcolorless+order%3Aspoiled&unique=prints').json()['data']
    queue = []
    try:
        queue = json.loads(open('queue.json').read())
    except:
        pass
    feedcontents = []
    try:
        feedcontents = json.loads(open('feed.json').read())
    except:
        pass

    # Add all new cards to the queue.
    newcardlist = []
    oldcarddict = {}
    for card in oldcardlist:
        oldcarddict[card['id']] = card
        newcardlist.append({'id': card['id']})
    carddict = {}
    for card in cardlist:
        carddict[card['id']] = card
    queuedict = {}
    for card in queue:
        queuedict[card['id']] = card

    for card in carddict:
        if card not in oldcarddict:
            queue.append(carddict[card])
            newcardlist.append({'id': card})

    # Allow the RSS feed to contain the 50 newest cards
    breakoff = queue[:50]
    queue = queue[50:]
    breakoff.reverse()
    feedcontents = (breakoff+feedcontents)[:50]

    # Generate a new RSS feed out of feedcontents
    rsstext = ""
    rsstext += """<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="https://mtgshare.org/spoilers.rss"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0" xml:base="https://mtgashare.org"><channel><title>MTG Spoilers</title><link>https://mtgashare.org</link><description/><language>en</language>"""
    
    for card in feedcontents:
        uri = card['scryfall_uri'].rsplit('/', 1)[0]
        source_uri = None
        if "preview" in card and "source_uri" in card["preview"]:
            source_uri = card["preview"]["source_uri"]
           
           
        rsstext += "<item>"
        rsstext += "<title>"+"[%s] %s"%(card['set'], card['name'])+"</title>"
        rsstext += "<link>"+uri+"</link>"
        rsstext += "<guid>"+uri+"</guid>"
        rsstext += "<description><![CDATA["
        
        rsstext += "<p>%s</p>"%card['type_line']
        if "oracle_text" in card:
            rsstext += "<p>%s</p>"%card['oracle_text']
        if source_uri:
            rsstext += "<p>%s</p>"%source_uri
        rsstext += '<p><img src="%s" /></p>'%card['image_uris']['normal']
        
        rsstext += "]]></description>"
        rsstext += "</item>"



    rsstext += """</channel></rss>"""


    # Save our files.
    open('../spoilers.rss', "w").write(rsstext)
    open('cardlist.json', 'w').write(json.dumps(newcardlist))
    open('queue.json', 'w').write(json.dumps(queue))
    open('feed.json', 'w').write(json.dumps(feedcontents))





if __name__ == '__main__':
    update()
