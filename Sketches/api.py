from fastapi import FastAPI
import json

app = FastAPI()

@app.get("/hackrf")
def get_hackrf():

    with open("hackrf_data.json") as f:
        return json.load(f)