The \*.pem files were (or, can be generated) generated using instructions from https://lowendbox.com/blog/getting-started-with-mysql-over-ssl/

Sequence of commands:

- openssl genrsa 2048 > ca-key.pem
- openssl req -sha1 -new -x509 -nodes -days 3650 -key ca-key.pem > ca-cert.pem
- openssl req -sha1 -newkey rsa:2048 -days 730 -nodes -keyout server-key.pem > server-req.pem
- openssl rsa -in server-key.pem -out server-key.pem
- openssl x509 -sha1 -req -in server-req.pem -days 730 -CA ca-cert.pem -CAkey ca-key.pem -set_serial 01 > server-cert.pem

In the end,
ssl-ca=/etc/mysql/ca-cert.pem
ssl-cert=/etc/mysql/server-cert.pem
ssl-key=/etc/mysql/server-key.pem
