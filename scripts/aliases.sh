#! /bin/bash

full_path=$(realpath $0)
dir_path=$(dirname $full_path)

alias get="bash ${dir_path}/get.sh"
alias del="bash ${dir_path}/delete.sh"
alias update="bash ${dir_path}/update.sh"
alias populate="bash ${dir_path}/populate.sh"