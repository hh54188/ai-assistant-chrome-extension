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

# Usage:
# try:
#     current_dir = Path(__file__).resolve().parent
#     file_path = current_dir / "cover.png"
#     upload_image(file_path)
# except ApiClientError as error:
#     print(error.text)

def create_compagin(subject, title_slug_str):
    try:
        last_compagin_id = get_latest_compagin()
        new_compagin = client.campaigns.replicate(last_compagin_id)
        new_compagin_id = new_compagin["id"]

        client.campaigns.update(new_compagin_id, {
            "settings": {
                "subject_line": subject,
                "title": title_slug_str
            }})

        client.campaigns.set_content(new_compagin_id, {
            "template": {
                "id": 10054406,
                "sections": {
                    "title": "=======>Black Phone<======"
                }
            }
        })

        last_compagin_content = client.campaigns.get_content(new_compagin_id)
        print(last_compagin_content)
    except ApiClientError as error:
        print("Error: {}".format(error.text))

# Usage:
create_compagin("测试", "test-test")