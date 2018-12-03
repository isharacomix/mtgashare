
import requests
import json

raw_data = requests.get("https://archive.scryfall.com/json/scryfall-oracle-cards.json").json()
clean_data = []

for card in raw_data:
    new_card = {}
    for field in ['name', 'color_identity', 'image_uris', 'type_line', 'card_faces']:
        if field in card:
            new_card[field] = card[field]
    if "image_uris" in new_card:
        new_card['image_uris'] = {'normal': card['image_uris']['normal'],
                                  'small': card['image_uris']['small'],}
    clean_data.append(new_card)
open("../js/cards.js", 'w').write("var cards = %s"%json.dumps(clean_data))
