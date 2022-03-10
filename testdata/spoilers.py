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
    breakoff = queue[:10]
    queue = queue[10:]
    breakoff.reverse()
    feedcontents = (breakoff+feedcontents)[:50]

    open('cardlist.json', 'w').write(json.dumps(newcardlist))
    open('queue.json', 'w').write(json.dumps(queue))
    open('feed.json', 'w').write(json.dumps(feedcontents))

def post():
    feedcontents = []
    try:
        feedcontents = json.loads(open('feed.json').read())
    except:
        pass
        
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
            for l in card['oracle_text'].splitlines():
                rsstext += "<p>%s</p>"%l
        if source_uri:
            rsstext += '<p><a href="%s">%s</a></p>'%(source_uri,source_uri)
        if "card_faces" in card:
            for face in card['card_faces']:
                rsstext += '<p><img src="%s" /></p>'%face['image_uris']['normal']
        else:
            rsstext += '<p><img src="%s" /></p>'%card['image_uris']['normal']
        
        rsstext += "]]></description>"
        rsstext += "</item>"



    rsstext += """</channel></rss>"""


    # Save our files.
    open('../spoilers.rss', "w").write(rsstext)



def esports():
    result = ""
    result += """<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="https://magic.wizards.com/sites/all/themes/wiz_mtg/xml/rss.xsl"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0" xml:base="https://magic.gg"><channel><title>MTG Esports</title><link>https://magic.gg</link><description/><language>en</language>"""
    indata = {
        "operationName": None,
        "query": """fragment articleFields on Article {  sys {    id    __typename  }  author  articleTitle  articleFeaturedImage {    url    __typename  }  slug  publishedDate  categories  outboundLink  __typename}query ($preview: Boolean, $search: String = "", $skip: Int = 0, $chunkSize: Int = 5, $category: String = "", $filterByCategory: Boolean = false) {  articlesInCategory: articleCollection(preview: $preview, skip: $skip, limit: $chunkSize, order: publishedDate_DESC, where: {skipNewsPage_not: true, eventsArticle_not: true, categories_contains_some: [$category], OR: [{articleTitle_contains: $search}, {articleBody_contains: $search}, {author_contains: $search}]}) @include(if: $filterByCategory) {    total    items {      ...articleFields      __typename    }    __typename  }  allArticles: articleCollection(preview: $preview, skip: $skip, limit: $chunkSize, order: publishedDate_DESC, where: {skipNewsPage_not: true, eventsArticle_not: true, OR: [{articleTitle_contains: $search}, {articleBody_contains: $search}, {author_contains: $search}]}) @skip(if: $filterByCategory) {    total    items {      ...articleFields      __typename    }    __typename  }  articlesInAll: articleCollection(preview: $preview, where: {skipNewsPage_not: true, eventsArticle_not: true, OR: [{articleTitle_contains: $search}, {articleBody_contains: $search}, {author_contains: $search}]}) {    total    __typename  }  articlesInEvents: articleCollection(preview: $preview, where: {skipNewsPage_not: true, eventsArticle_not: true, categories_contains_some: ["Events"], OR: [{articleTitle_contains: $search}, {articleBody_contains: $search}, {author_contains: $search}]}) {    total    __typename  }  articlesInUpdates: articleCollection(preview: $preview, where: {skipNewsPage_not: true, eventsArticle_not: true, categories_contains_some: ["Updates"], OR: [{articleTitle_contains: $search}, {articleBody_contains: $search}, {author_contains: $search}]}) {    total    __typename  }  articlesInPlayers: articleCollection(preview: $preview, where: {skipNewsPage_not: true, eventsArticle_not: true, categories_contains_some: ["Players"], OR: [{articleTitle_contains: $search}, {articleBody_contains: $search}, {author_contains: $search}]}) {    total    __typename  }}""",
        "variables": {
            "category": "Events",
            "chunkSize": 20,
            "filterByCategory": False,
            "preview": False,
            "search": "",
            "skip": 0
        }
    }
    data = requests.post("https://www.magic.gg/api/contentful/apollo", json=indata).json()

    featureditems = data["data"]["allArticles"]["items"]
    for subitem in featureditems:
        title = subitem["articleTitle"]
        link = subitem["outboundLink"]
        if link is None:
            link = "https://magic.gg/news/"+subitem["slug"]
        
        result += "<item>"
        result += "<title>"+title+"</title>"
        result += "<link>"+link+"</link>"
        result += "<guid>"+link+"</guid>"
        result += "<description>"
        if "articleFeaturedImage" in subitem:
            result += '<![CDATA[<img src="%s">]]>'%subitem["articleFeaturedImage"]["url"]
        result += "</description>"
        result += "</item>"

    result += """</channel></rss>"""
    open('../esports.rss', "w").write(result)


if __name__ == '__main__':
    update()
    post()
    esports()
