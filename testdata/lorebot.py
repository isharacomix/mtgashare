#!/usr/bin/env python3
# -*- coding: utf-8 -*-



import os, sys
import json, wget
import requests
import time



def lore():
    result = ""
    result += """<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0" xml:base="https://pathfinderwiki.com"><channel><title>Pathfinder Wiki</title><link>https://pathfinderwiki.com</link><description/><language>en</language>"""

    data = None
    while data is None:
        data = requests.get("https://pathfinderwiki.com/wiki/Special:Random/Main")
        if data and "/wiki/Category:Authors" in data.text:
            data = None
        if data and "/wiki/Category:Artists" in data.text:
            data = None
        time.sleep(5)
        
    
    name = data.url.split('/')[-1].replace('_', ' ')
    summary = ""
    #summary = data.text.split('role="article"')[1].split('<p>')[1].split('</p>')[0]
    #summary = summary.replace('[', '(').replace(']',')')


    result += "<item>"
    result += "<title>"+name+"</title>"
    result += "<link>"+data.url+"</link>"
    result += "<guid>"+data.url+"</guid>"
    result += "<description><![CDATA["
    result += summary
    result += "]]></description>"
    result += "</item>"

    result += """</channel></rss>"""
    open('../lore.rss', "w").write(result)


if __name__ == '__main__':
    lore()
