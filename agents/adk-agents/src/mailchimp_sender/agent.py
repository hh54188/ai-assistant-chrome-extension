import errno
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
import time
import os
import base64
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

MAILCHIMP_API_KEY = os.getenv("MAILCHIMP_API_KEY")
MAILCHIMP_SERVER = os.getenv("MAILCHIMP_SERVER")

client = MailchimpMarketing.Client()
client.set_config({"api_key": MAILCHIMP_API_KEY, "server": MAILCHIMP_SERVER})


def get_latest_compagin() -> str:
    response = client.campaigns.list(sort_field="create_time", sort_dir="DESC")
    last_compagin = response["campaigns"][0]
    last_compagin_id = last_compagin["id"]

    return last_compagin_id

def upload_image(file_name: str, file_path: str) -> tuple[str, str]:
    with open(file_path, 'rb') as image_file:
        image = base64.b64encode(image_file.read())
        encoded_string = image.decode()
        response = client.fileManager.upload({ "name": file_name, "file_data": encoded_string })
        file_id = response["id"]
        full_size_url = response["full_size_url"]
        return (file_id, full_size_url)


def duplicate_last_campagin() -> str:
    try:
        last_compagin_id = get_latest_compagin()
        new_compagin = client.campaigns.replicate(last_compagin_id)
        new_compagin_id = new_compagin["id"]
        return new_compagin_id
    except ApiClientError as error:
        print("Error: {}".format(error.text))

def create_campagin(subject, title_slug_str):
    try:
        new_compagin_id = duplicate_last_campagin()
        client.campaigns.update(new_compagin_id, {
            "settings": {
                "subject_line": subject,
                "title": title_slug_str
            }})

        client.campaigns.set_content(new_compagin_id, {
            "template": {
                "id": 10054406,
                "sections": {
                }
            }
        })
    except ApiClientError as error:
        print("Error: {}".format(error.text))
