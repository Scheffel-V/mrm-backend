#! /bin/bash

full_path=$(realpath $0)
dir_path=$(dirname $full_path)
url="localhost:3134/api/additives"

for json_filename in ${dir_path}/*_create.json
do
  path="@${json_filename}"

  curl \
  -X POST \
  "${url}" \
  -H 'Content-Type: application/json' \
  -d "${path}" | jq .
done