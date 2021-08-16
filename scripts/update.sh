#! /bin/bash

curl -X PUT localhost:3134/api/$1 -H 'Content-Type: application/json' -d "@${2}" | jq .