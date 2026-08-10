import json


def save_observation(data):

    with open(
        "observation.json",
        "w"
    ) as file:

        json.dump(data,file)