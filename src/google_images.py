from google_images_download import google_images_download

def get_celebrity_image_url(name): 
    response = google_images_download.googleimagesdownload()
    arguments = {'keywords': f"{name}", 'limit': 1, 'print_urls': True, 'no_download': True}
    paths = response.download(arguments)
    return paths[0][f"{name}"][0]
