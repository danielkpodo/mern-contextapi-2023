## USER MODEL

id
firstName -> string,
lastName -> string,
email -> string,
password -> string,
phoneNumber
role-> enum
createdBy - automatic
updatedBy -> automatic

## Restaurants

- id
- name
- address
- phoneNumber

## Orders

-> There should be an array of order to be submitted by the frontend

- id
- userId
- restaurantId
- orderTotal
- deliveryStatus
- items: [ // should go into a table called Deliverables
  {...}
  ]

## Menu

- id
- restaurantId,
- itemName
- price

## Ratings

- id,
- userId
- restaurantId,
- score
- description

// need to have a table that has the order id and the items in the menu inside
