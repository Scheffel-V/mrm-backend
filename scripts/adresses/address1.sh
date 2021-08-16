#! /bin/bash

full_path=$(realpath $0)
dir_path=$(dirname $full_path)
path="@${dir_path}/address1.json"
url="localhost:3134/api/addresses"


curl \
-X POST \
"${url}" \
-H 'Content-Type: application/json' \
-d "${path}"