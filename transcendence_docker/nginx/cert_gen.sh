#!/bin/bash

# Get the machine's IP address (assumes eth0 is the network interface)
HOST_IP=$(hostname -I | awk '{print $1}')
#HOST_IP="10.11.12.6"  # Uncomment and use this line if you want to hardcode the IP
echo "Host IP: $HOST_IP"

# If you prefer to use a custom domain name instead of IP, you can define it manually
DOMAIN_NAME="local.ftranscendence.local"  # You can change this

# Path where you want to store the certificates
CERT_DIR="./nginx/etc/certs"
CERT_FILE="$CERT_DIR/self_signed_cert.pem"
KEY_FILE="$CERT_DIR/self_signed_key.pem"
OPENSSL_CONF="$CERT_DIR/openssl.cnf"

# Create the certs directory if it doesn't exist
mkdir -p $CERT_DIR

# Create a temporary OpenSSL configuration template with placeholders
cat > $OPENSSL_CONF <<EOF
[ req ]
default_bits        = 2048
default_keyfile     = privkey.pem
distinguished_name  = req_distinguished_name
req_extensions      = v3_req
x509_extensions     = v3_ca
prompt              = no

[ req_distinguished_name ]
countryName         = PT
stateOrProvinceName = Porto
localityName        = Porto
organizationName    = 42 Porto
commonName          = ${HOST_IP}
emailAddress        = ftranscendence-no-reply@example.com

[ v3_req ]
basicConstraints    = CA:FALSE
keyUsage            = digitalSignature, keyEncipherment
extendedKeyUsage    = serverAuth, clientAuth
subjectAltName      = @alt_names

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
basicConstraints     = critical,CA:true
keyUsage             = digitalSignature, keyCertSign, cRLSign
subjectAltName       = @alt_names

[ alt_names ]
DNS.1 = ${HOST_IP}
IP.1  = ${HOST_IP}
EOF

echo "Check the content of openssl.cnf before substitution:"
cat $OPENSSL_CONF

echo "Check file path"
echo $OPENSSL_CONF
ls -l $CERT_DIR
cat $CERT_DIR/openssl.cnf

# Generate the self-signed certificate using the dynamically generated config file
openssl req -x509 -nodes -newkey rsa:2048 -keyout $KEY_FILE -out $CERT_FILE -days 365 -config $CERT_DIR/openssl.cnf

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "Self-signed certificate generated for IP: $HOST_IP"
else
    echo "Error: Certificate generation failed."
    exit 1
fi

# Path to the .env file
ENV_FILE=".env"

# Update or add the ALLOWED_HOST variable in the .env file
if [[ -n "$HOST_IP" ]]; then
    if grep -q "ALLOWED_HOST=" "$ENV_FILE"; then
        # Update the existing ALLOWED_HOST entry
        sed -i "s/^ALLOWED_HOST=.*/ALLOWED_HOST=$HOST_IP/" "$ENV_FILE"
        echo "Updated ALLOWED_HOST in $ENV_FILE to: $HOST_IP"
    else
        # Add ALLOWED_HOST entry if it doesn't exist
        echo "ALLOWED_HOST=$HOST_IP" >> "$ENV_FILE"
        echo "Added ALLOWED_HOST to $ENV_FILE: $HOST_IP"
    fi
else
    echo "Failed to determine the host IP. Please check your network configuration."
    exit 1
fi

