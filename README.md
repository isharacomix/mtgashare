# MTGAShare
MTGAShare is a serverless tool for sharing Magic the Gathering decks and drafts with others on social media. By serverless, it means that the handling is done entirely by the browser, without the need for a database or web application.

To try it out, visit https://mtgashare.org/ and paste either a decklist or a draft log (in MTGO format, see the examples in `testdata/`), then visit the link created by the application. You'll notice that this link is extremely long!

    https://mtgashare.org/#eJxNUU1P5DAM/StWLnvpCi0X0NzQDPMh7bIIhDib1EytpknlJAWK5r/jpIPEqfHzs59f36dpyfZm9WkGZF++h+jQt2Z11Zh/IftU4evGrHFMWQgex46EzOpPYzY8sMDBvwYZ0CezumzMHR+7NBE7JQqnhfjk6X10uola2HDEcSQU9JbqyDoMOt5C6nR70l11Zh3iEJIEzxaecfpWFLIJ1lmEiqBCt04RCTFhUuaWybUV3yoVnsR25X5V2QlOXCj32duuUv6LJ/mAXXhxhaTIY3WYhPtFb2nBWWMoJ0tt7D/GoPdGnme3UJ+JYCN4DB5zissJQrH7vUWrth/ISuZ0tuY9TwQXF6BPG2w6m4s2TOUibWgxkkR0i8n3EX3k4EtLCxdKUVuHeaYEf4PtKf0Adplde8QSwOWpMZFbKunuCR3Jrwh7fOsXyxqF7UAzhJvZaoxYNM7PZgkl+548POT6l06n0xeCdrrp

Most social media sites such as Twitter and Mastodon will automatically shorten the links you post, meaning that you can post a link with 520 characters, but it will only take up about 20 characters out of your limit. For sites that do not automatically shorten links, such as Discord, you can use a URL shortening service such as bitly or TinyUrl (if you decide to use a link shortener, especially in a chat room, I recommend giving others a preview link when possible)

The motivation behind this project is to provide a way to share your decks and drafts with other people on an open-source, ad-free tool.
