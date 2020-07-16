
import requests
import json

filename = requests.get("https://api.scryfall.com/bulk-data").json()["data"][0]["download_uri"]
raw_data = requests.get(filename).json()
clean_data = []

for card in raw_data:
    new_card = {}
    for field in ['name', 'color_identity', 'image_uris', 'type_line', 'card_faces', 'scryfall_uri']:
        if field in card:
            new_card[field] = card[field]
    if "image_uris" in new_card:
        new_card['image_uris'] = {'normal': card['image_uris']['normal'],
                                  'small': card['image_uris']['small'],}
    clean_data.append(new_card)
open("../js/cards.js", 'w').write("var cards = %s"%json.dumps(clean_data))
