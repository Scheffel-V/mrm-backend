import http.client, json, random, math

MRM_ENDPOINT="localhost:3134"
JSON_HEADERS={"Content-Type": "application/json"}

def create_additive(additive):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(additive, indent = 4)
  connection.request("POST", "/api/additives", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def create_address(address):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(address, indent = 4)
  connection.request("POST", "/api/addresss", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def create_customer(customer):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(customer, indent = 4)
  connection.request("POST", "/api/customers", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def create_itemrental(itemrental):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(itemrental, indent = 4)
  connection.request("POST", "/api/itemrentals", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def create_rentcontract(rentcontract):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(rentcontract, indent = 4)
  connection.request("POST", "/api/rentcontracts", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def create_stockitem(stockitem):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(stockitem, indent = 4)
  connection.request("POST", "/api/stockitems", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def create_supplier(supplier):
  connection = http.client.HTTPConnection(MRM_ENDPOINT)
  body = json.dumps(supplier, indent = 4)
  connection.request("POST", "/api/suppliers", body, JSON_HEADERS)
  response = connection.getresponse()
  connection.close()
  return response

def get_semi_random_supplier_cnpj(index):
  cnpj = f"{random.randint(5,9)}{random.randint(0,9)}.{random.randint(0,9)}{random.randint(0,9)}{random.randint(0,9)}.{random.randint(0,9)}{random.randint(0,9)}{random.randint(0,9)}/"
  for i in range(4):
    cnpj += f"{math.floor(index%math.pow(10,6-i)/math.pow(10,5-i))}"
  cnpj += f"-{math.floor(index%100/10)}{index%10}"
  return cnpj

def get_semi_random_customer_cnpj(index):
  cnpj = f"{random.randint(0,4)}{random.randint(0,9)}.{random.randint(0,9)}{random.randint(0,9)}{random.randint(0,9)}.{random.randint(0,9)}{random.randint(0,9)}{random.randint(0,9)}/"
  for i in range(4):
    cnpj += f"{math.floor(index%math.pow(10,6-i)/math.pow(10,5-i))}"
  cnpj += f"-{math.floor(index%100/10)}{index%10}"
  return cnpj

def get_randomized_supplier(index):
  return {
    "name": f"Supplier {index} Name",
    "commercialName": f"Supplier {index} Commercial Name",
    "cnpj": get_semi_random_supplier_cnpj(index),
    "mobilePhone": "(XX) XXX-XXX-XXX",
    "email": f"supplier{index}@email.com",
    "active": random.randint(0,1) == 0,
    "address": {
      "street": f"Supplier {index} Street Name",
      "cep": "XXXXX-XXX",
      "city": f"Supplier {index} City",
      "number": f"Supplier {index} building number",
      "neighborhood": f"Supplier {index} neighborhood"
    },
    "comment": f"Comments related to Supplier {index}",
  }

def get_randomized_customer(index):
  return {
    "name": f"Customer {index} Name",
    "commercialName": f"Customer {index} Commercial Name",
    "cnpj": get_semi_random_customer_cnpj(index),
    "mobilePhone": get_semi_random_customer_cnpj(index),
    "email": f"customer{index}@email.com",
    "active": random.randint(0,1) == 0,
    "address": {
      "street": f"Customer {index} Street Name",
      "cep": "XXXXX-XXX",
      "city": f"Customer {index} City",
      "number": f"Customer {index} building number",
      "neighborhood": f"Customer {index} neighborhood"
    },
    "comment": f"Comments related to Customer {index}",
  }

def get_randomized_stockitem(index, min_supplier_id=1, max_supplier_id=499):
  if random.randint(1,10) == 6:
    status = "INVENTORY"
  else:
    status = "MAINTENANCE"

  code = str(334134254 + index)
  acquisition_year = random.randint(1995, 2018)

  last_maintenance_year = random.randint(2018, 2020)
  while last_maintenance_year < acquisition_year:
    last_maintenance_year = random.randint(2018, 2020)

  acquisition_date = '%d:%02d:%02d' % (acquisition_year, random.randint(1, 12), random.randint(1, 28))
  last_maintenance = '%d:%02d:%02d' % (last_maintenance_year, random.randint(1, 12), random.randint(1, 28))

  rent_value = random.randint(10, 100)*10
  replacement_cost = rent_value * random.randint(7, 30)

  return {
    "name": f"Stock Item {index} Name",
    "type": f"Stock Item {index} Type",
    "brand": f"Stock Item {index} Brand",
    "model": f"Stock Item {index} Model",
    "power": f"Stock Item {index} Power",
    "voltage": f"Stock Item {index} Voltage",
    "pressure": f"Stock Item {index} Pressure",
    "throughput": f"Stock Item {index} Throughput",
    "year": f"Stock Item {index} Year",
    "serialNumber": f"Stock Item {index} Serial Number",
    "status": status,
    "numberOfUses": random.randint(4, 420),
    "lastMaintenance": last_maintenance,
    "acquisitionDate": acquisition_date,
    "needsMaintenance": random.randint(0,1) == 0,
    "imageURL": "imageURL",
    "rentValue": rent_value,
    "replacementCost": rent_value,
    "code": code,
    "active": random.randint(0,1) == 0,
    "comment": f"Comment about Stock Item {index}",
    "supplierId": random.randint(min_supplier_id, max_supplier_id)
  }

def populate_suppliers(number_of_instances=100):
  print("Populating suppliers...")
  for i in range(number_of_instances):
    r = create_supplier(get_randomized_supplier(i + 1))
    if r.status != 201:
      print(r.status)
  print("Finished populating suppliers!")

def populate_customers(number_of_instances=100):
  print("Populating customers...")
  for i in range(number_of_instances):
    r = create_customer(get_randomized_customer(i + 1))
    if r.status != 201:
      print(r.status)
  print("Finished populating customers!")

def populate_stockitems(number_of_instances=100):
  print("Populating stock items...")
  for i in range(number_of_instances):
    r = create_stockitem(get_randomized_stockitem(i + 1))
    if r.status != 201:
      print(r.status)
  print("Finished populating stock items!")

if __name__ == "__main__":
  populate_suppliers(500)
  populate_customers(500)
  populate_stockitems(1000)