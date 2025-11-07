import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
import os
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


try:
    last_compagin_id = get_latest_compagin()
    new_compagin = client.campaigns.replicate(last_compagin_id)
    new_compagin_id = new_compagin["id"]

    client.campaigns.update(new_compagin_id, {
        "settings": {
            "subject_line": "测试测试",
            "title": "test, test",
        }})
    
    print(new_compagin)

    # last_compagin_content = client.campaigns.get_content(last_compagin_id)
    # print(last_compagin_content)
except ApiClientError as error:
    print("Error: {}".format(error.text))
