# Identity provider and authentification microservice

This services has basic functionality for user management and authentification.

## Api documentation

For the api documentation, please open [this repository](https://github.com/stefanFCB94/musicplayer-documentation).

To view the api documentation, follow the instructions, described in the README of the references repository.


## Environment variables

|Variable|Default value|Description|
|---|---|---|
|AUTH_HTTP_PORT|80|Port on which the http server of the service should listen|
|AUTH_HTTPS_PORT|443|Port on whicht the https server of the service should listen|
|AUTH_USE_HTTPS|false|Should be set, if the service should be operate only over https|
|CERTIFICATE_FILE|-|Path to the certificate file, which should be used to start the https server|
|PRIVATE_KEY_FILE|-|Path to the private key file, which should be used to start the https server|
|LOGGER_USE_HTTPS|false|Set be set, if to the logger microservice should be talked over https|
|LOGGER_HTTPS_PORT|443|The port on which the logger microservice is listenening on via https (only to set, if LOGGER_USE_HTTPS is set)|
|LOGGER_HTTP_PORT|80|The port on which the logger microservice is listening on via http (only set, if LOGGER_USE_HTTPS is not set)|
|LOGGER_HOST|logger|Hostname oder ip adress, on which the logger microservice could be reachted|
|LOGGER_SERVICE_NAME|Identity-Provider|The name of the service, that should be used for logging|
|DB_HOST|db|Hostname or ip adress on which the database could be reached |
|DB_PORT|5432|The port on which the database is listening on|
|AUTH_DB_USERNAME|identity|The username, which should be used to connect to the database|
|AUTH_DB_PASSWORD|identity|The password, that should be used to connect to the database|
|AUTH_DB_DATABASE|identity|The name of the database, that should be used to save the data of the service|
