# Event Management API

## Setup

### Clone Repository
```bash
git clone https://github.com/nkhatri7/event-management-api.git
```

### Setup Database
This project uses [PostgreSQL](https://www.postgresql.org/) for the database. I used [this video](https://www.youtube.com/watch?v=qw--VYLpxG4&t=1851s) to learn how to install PostgreSQL on my device and get started.

Once you have PostgreSQL installed and can use the `psql` command, go through the following steps to setup the database for this project:

```bash
# Create the database
CREATE DATABASE event_management;

# Connect to the database
\c event_management

# Create the users/customers table
CREATE TABLE customer (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(80) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL,
);

# Create the venues table
CREATE TABLE venue (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  postcode VARCHAR(4) NOT NULL,
  state VARCHAR(3) NOT NULL,
  capacity INT NOT NULL,
  hourly_rate DECIMAL NOT NULL,
  ADD CONSTRAINT check_state CHECK (state IN  ('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'))
);

# Create the events table
CREATE TABLE event (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer(id),
  venue_id BIGINT NOT NULL REFERENCES venue(id),
  day INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  start_time INT NOT NULL,
  end_time INT NOT NULL,
  guests INT NOT NULL,
  is_cancelled BOOLEAN NOT NULL
);
```

### Environment Variables
Create a `.env` file and copy the keys from `.env.template` and fill out the missing values.

### Server
First install the dependencies and then start the server!
```bash
npm install
npm run dev

# Once server has started it should log 'Server is listening on port 3000' (or whatever port you've set in the `.env` file)
```
