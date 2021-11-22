Prerequirements

- Python 3.9

Run the following commands:

```
  pip install -r requirements.txt
  $env:FLASK_APP="app"
  $env:FLASK_ENV = "development"
```

Replace the following files:

- `[venv]/google_images_download/google_images_download.py` with `lib-fixes/google_images_download.py`.
- `[venv]/keras_vggface/utils.py` with `lib-fixes/utils.py`.

Navigate to the `./src` folder and run:

```
  flask run
```
