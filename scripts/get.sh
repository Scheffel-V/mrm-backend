#! /bin/bash

curl localhost:3134/api/$1 | jq . 