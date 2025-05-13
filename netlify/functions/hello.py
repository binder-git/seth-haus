# /Users/seth/seth-haus/netlify/functions/hello.py
import json

def handler(event, context):
    print("Hello function invoked!") # You should see this in netlify dev logs if called
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"message": "Hello from Netlify Function!"})
    }