#!/bin/bash

# Get the machine's IP address (assumes eth0 is the network interface)
HOST_IP=$(hostname -I | awk '{print $1}')
#HOST_IP="10.11.12.6"
echo "Host IP: $HOST_IP"

# If you prefer to use a custom domain name instead of IP, you can define it manually
DOMAIN_NAME="local.ftranscendence.local"  # You can change this

# Path where you want to store the certificates
CERT_DIR="./etc/certs"
CERT_FILE="$CERT_DIR/self_signed_cert.pem"
KEY_FILE="$CERT_DIR/self_signed_key.pem"

# Create the certs directory if it doesn't exist
mkdir -p $CERT_DIR

# Generate a new self-signed certificate using the IP address or domain name
openssl req -x509 -nodes -newkey rsa:2048 -keyout $KEY_FILE -out $CERT_FILE -days 365 \
  -subj "/C=PT/ST=Porto/L=Porto/O=42Porto/OU=Department/CN=$HOST_IP"

echo "Self-signed certificate generated for IP: $HOST_IP"
