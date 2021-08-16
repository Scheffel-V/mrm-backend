#! /bin/bash

full_path=$(realpath $0)
dir_path=$(dirname $full_path)

curl "localhost:3134/db/reset"

bash ${dir_path}/customer/create_customers.sh
bash ${dir_path}/supplier/create_suppliers.sh
bash ${dir_path}/stockitem/create_stockitems.sh
bash ${dir_path}/rentcontract/create_rentcontracts.sh
bash ${dir_path}/itemrental/create_itemrentals.sh
bash ${dir_path}/additive/create_additives.sh
bash ${dir_path}/stockitemevent/create_stockitemevents.sh