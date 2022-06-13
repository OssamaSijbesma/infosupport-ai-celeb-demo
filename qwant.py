import requests


def get_celeb_image(name):
    name = name.encode(encoding='ascii', errors='ignore')
    r = requests.get("https://api.qwant.com/v3/search/images",
                     params={
                         'count': 3,
                         'q': name,
                         't': 'images',
                         'safesearch': 1,
                         'locale': 'en_US',
                         'offset': 0,
                         'device': 'desktop'
                     },
                     headers={
                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
                     }
                     )

    response = r.json().get('data').get('result').get('items')
    paths = [r.get('media') for r in response]
    return paths[0]
