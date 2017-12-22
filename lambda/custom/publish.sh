#! /bin/bash
# Ref: https://developer.amazon.com/blogs/post/Tx1UE9W1NQ0GYII/Publishing-Your-Skill-Code-to-Lambda-via-the-Command-Line-Interface

rm index.zip 
zip -X -r ./index.zip *
aws lambda update-function-code --function-name ask-custom-highschooler-default --zip-file fileb://index.zip

