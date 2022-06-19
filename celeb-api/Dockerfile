FROM python:3.10

WORKDIR /app

COPY ./requirements.txt ./requirements.txt

RUN apt-get update

RUN apt-get install -y python3-opencv

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . ./

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]